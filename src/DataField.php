<?php
declare(strict_types=1);

namespace AdrHumphreys\DataField;

use InvalidArgumentException;
use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\FormField;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\DataObjectInterface;

class DataField extends FormField
{
    private const EDITABLE_FIELD_CONFIG = 'editable_fields';
    private const EDITABLE_FIELD_CONFIG_FUNC = 'getEditableFields';
    private const DEFAULT_EDITABLE_CELL = 'EditableCell';
    private const RECORD_ID = '_RecordID';

    // Config options which users can change
    public const COLUMN_TITLE = 'Header';
    public const COLUMN_VALUE = 'accessor';
    public const COLUMN_CELL = 'Cell';
    public const COLUMN_DATA = 'columnData';
    public const DROPDOWN_CELL = 'DropdownCell';

    /**
     * @var string
     */
    protected $schemaDataType = FormField::SCHEMA_DATA_TYPE_CUSTOM;

    /**
     * @var string
     */
    protected $schemaComponent = 'DataField';

    /**
     * @var string
     */
    private $className;

    /**
     * @var string
     */
    private $relationName;

    /**
     * @var string|null
     */
    private $sortField;

    /**
     * Creates a new field.
     *
     * @param string $name
     *  The internal field name, passed to forms. If no relation name is passed through then,
     *  we use the name as the relation name
     * @param string|null $title
     *  The human-readable field label.
     * @param string|null $className
     *  The class name for the data that will be on the field.
     *  If not set then it will default to he relation classname
     * @param string|null $relationName
     *  If you want to use a different relation to the name of the field
     */
    public function __construct(string $name, ?string $title = null, ?string $className = null, ?string $relationName = null)
    {
        parent::__construct($name, $title, null);
        $this->addExtraClass('datafield');
        $this->className = $className;
        $this->relationName = $relationName;
    }

    public function getSchemaStateDefaults()
    {
        $state = parent::getSchemaStateDefaults();

        $state['structure'] = $this->getStructure();
        $state['value'] = $this->getRows();

        if ($this->sortField) {
            $state['sortField'] = $this->sortField;
        }

        return $state;
    }

    /*
     * Enable sorting by passing the field that stores the sort order
     */
    public function setSort(string $sortField): DataField
    {
        $this->sortField = $sortField;

        return $this;
    }

    /*
     * Used on the template to provide a json encoded version of the information
     */
    public function jsonRows(): string
    {
        return json_encode($this->getRows());
    }

    public function getRows(): array
    {
        $record = $this->getForm()->getRecord();
        $relationName = $this->relationName ?? $this->getName();
        $relation = $record->getComponents($relationName);
        $className = $this->className ?? $relation->dataClass();
        $editableFields = $this->getEditableFields($className);

        $result = [];

        if ($this->sortField) {
            $relation = $relation->sort($this->sortField);
        }

        foreach ($relation as $item) {
            $datum = [];
            $datum[self::RECORD_ID] = $item->ID;

            foreach ($editableFields as $editableField) {
                if (is_array($editableField)) {
                    $valueField = $editableField[self::COLUMN_VALUE] ?? $editableField[self::COLUMN_TITLE];
                    $datum[$valueField] = $item->getField($valueField);

                    continue;
                }

                if (is_string($editableField)) {
                    $datum[$editableField] = $item->getField($editableField);

                    continue;
                }

                throw new InvalidArgumentException('Editable fields need to be an array or string');
            }

            $result[] = $datum;
        }

        return $result;
    }

    public function getStructure(): array
    {
        $record = $this->getForm()->getRecord();
        $relationName = $this->relationName ?? $this->getName();
        $relation = $record->getComponents($relationName);
        $className = $this->className ?? $relation->dataClass();
        $editableFields = $this->getEditableFields($className);

        if ($editableFields === null || !is_array($editableFields)) {
            throw new InvalidArgumentException(sprintf(
                'Class: %s has not implemented $%s',
                $className,
                self::EDITABLE_FIELD_CONFIG
            ));
        }

        $structure = [];

        foreach ($editableFields as $editableField) {
            // If the developer has specified the
            if (is_array($editableField)) {
                $structure[] = [
                    self::COLUMN_TITLE => $editableField[self::COLUMN_TITLE],
                    self::COLUMN_VALUE => $editableField[self::COLUMN_VALUE] ?? $editableField[self::COLUMN_TITLE],
                    self::COLUMN_CELL => $editableField[self::COLUMN_CELL] ?? self::DEFAULT_EDITABLE_CELL,
                    self::COLUMN_DATA => $editableField[self::COLUMN_DATA] ?? null,
                ];

                continue;
            }

            if (is_string($editableField)) {
                $structure[] = [
                    self::COLUMN_TITLE => $editableField,
                    self::COLUMN_VALUE => $editableField,
                    self::COLUMN_CELL => self::DEFAULT_EDITABLE_CELL,
                ];

                continue;
            }

            throw new InvalidArgumentException('Editable fields need to be an array or string');
        }

        return $structure;
    }

    /*
     * When submitted we get a json string which represents an array of objects
     */
    public function setSubmittedValue($value, $data = null)
    {
        return $this->setValue(json_decode($value), $data);
    }

    public function saveInto(DataObjectInterface $record)
    {
        $record = $this->getForm()->getRecord();
        $relationName = $this->relationName ?? $this->getName();
        $relation = $record->getComponents($relationName);
        $className = $this->className ?? $relation->dataClass();

        /** @var array $items */
        $items = $this->Value();

        if ($items === null || !is_array($items)) {
            // Assumption here is that there was no data
            return;
        }

        $itemIDs = [];

        foreach ($items as $position => $item) {
            if (!is_object($item)) {
                throw new InvalidArgumentException('We\'ve been sent odd items');
            }

            $itemRecord = null;

            if (isset($item->{self::RECORD_ID})) {
                $itemRecord = DataObject::get_by_id($className, $item->{self::RECORD_ID});
            }

            if ($itemRecord === null) {
                $itemRecord = Injector::inst()->create($className);
            }

            $editableFields = $this->getEditableFields($className);

            foreach ($editableFields as $editableField) {

                $fieldName = is_array($editableField)
                    ? $editableField[self::COLUMN_VALUE] ?? $editableField[self::COLUMN_TITLE]
                    : $editableField;

                // First we check that the field actually exists in the item
                if(!isset($item->{$fieldName})) {
                    continue;
                }

                $itemRecord->setField($fieldName, $item->{$fieldName});
            }

            if ($this->sortField) {
                $itemRecord->setField($this->sortField, $position);
            }

            $itemIDs[] = $itemRecord->write();
        }

        if (count($itemIDs) > 0) {
            $relation->setByIDList($itemIDs);
        }
    }

    // Pass in a class name and get an array of editable fields back
    // If you don't then PHP will throw an exception for us :tada:
    private function getEditableFields(string $className): array
    {
        if (method_exists($className, self::EDITABLE_FIELD_CONFIG_FUNC)) {
            return $className::{self::EDITABLE_FIELD_CONFIG_FUNC}();
        }

        return Config::forClass($className)->get(self::EDITABLE_FIELD_CONFIG);
    }
}
