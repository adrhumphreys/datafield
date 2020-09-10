import React from "react";
import { useTable } from "react-table";
import { Table as TableStrap } from "reactstrap";
import { inject } from "lib/Injector";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

function Table({
  columns,
  data,
  updateMyData,
  removeRow,
  moveRow,
  TableHeader,
  TableRow,
  shouldSort,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
  } = useTable({
    columns,
    data,
    // Custom functions passed through
    updateMyData,
    removeRow,
    moveRow,
  });

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <TableStrap {...getTableProps()}>
          <TableHeader headerGroups={headerGroups} shouldSort={shouldSort} />
          <tbody {...getTableBodyProps()}>
            {rows.map((row, index) => {
              prepareRow(row);
              return (
                <TableRow
                  index={index}
                  row={row}
                  moveRow={moveRow}
                  shouldSort={shouldSort}
                  {...row.getRowProps()}
                />
              );
            })}
          </tbody>
        </TableStrap>
      </DndProvider>
    </div>
  );
}

export default inject(["TableHeader", "TableRow"])(Table);
