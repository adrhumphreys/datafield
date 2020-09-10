import React from "react";

const DeleteCell = ({ removeRow, row }) => (
  <button className="btn btn-primary" onClick={() => removeRow(row)}>
    Delete
  </button>
);

export default DeleteCell;
