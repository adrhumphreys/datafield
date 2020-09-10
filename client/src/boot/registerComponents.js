import DataField from "../components/DataField";
import EditableCell from "../components/EditableCell";
import DeleteCell from "../components/DeleteCell";
import DropdownCell from "../components/DropdownCell";
import Table from "../components/Table";
import TableHeader from "../components/TableHeader";
import TableRow from "../components/TableRow";
import Injector from "lib/Injector";

export default () => {
  Injector.component.registerMany({
    DataField,
    EditableCell,
    DeleteCell,
    DropdownCell,
    Table,
    TableHeader,
    TableRow,
  });
};
