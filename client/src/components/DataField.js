import React, { useEffect, useMemo, useState } from "react";
import { inject, loadComponent } from "lib/Injector";
import update from "immutability-helper";

const DataField = ({
  Table,
  DeleteCell,
  onChange,
  structure,
  value,
  sortField,
}) => {
  const shouldSort = sortField && sortField.length > 0;
  const [data, setData] = useState(value);
  useEffect(() => setData(value), [value]);
  useEffect(() => onChange(data), [data]);

  const removeRow = ({ index }) => {
    const filteredData = data.filter((item, itemIndex) => itemIndex !== index);
    setData(filteredData);
  };

  const columns = useMemo(() => {
    let defaultColumns = [
      ...structure.map((header) => ({
        ...header,
        Cell: loadComponent(header["Cell"]),
      })),
      {
        Header: "Delete",
        accessor: "_delete",
        Cell: DeleteCell,
      },
    ];

    return defaultColumns;
  }, [structure]);

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRecord = data[dragIndex];
    setData(
      update(data, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRecord],
        ],
      })
    );
  };

  const addRow = () => {
    const rowDatum = columns.map((column) => column.accessor);
    const newRow = rowDatum.map((row) => ({ [row]: "" }));
    setData([...data, newRow]);
  };

  return (
    <div>
      <Table
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        removeRow={removeRow}
        moveRow={moveRow}
        shouldSort={shouldSort}
      />
      <button
        onClick={addRow}
        className="btn btn-primary font-icon-plus-circled"
      >
        Add new
      </button>
    </div>
  );
};

export default inject(["Table", "DeleteCell"])(DataField);
