import React from "react";

const TableHeader = ({ headerGroups, shouldSort }) => {
  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {shouldSort && <th className="datafield__move" />}
          {headerGroup.headers.map((column) => (
            <th {...column.getHeaderProps()}>{column.render("Header")}</th>
          ))}
        </tr>
      ))}
    </thead>
  );
};

export default TableHeader;
