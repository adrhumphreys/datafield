import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";

const DropdownCell = ({
  value: initialValue,
  row: { index },
  column: { id, columnData },
  updateMyData,
}) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => updateMyData(index, id, value), [value]);
  const onChange = (event) => setValue(event.target.value);

  let options = [];
  for (const [key, value] of Object.entries(columnData)) {
    options.push(<option value={key}>{value}</option>);
  }

  return (
    <Input value={value} onChange={onChange} type="select">
      {options}
    </Input>
  );
};

export default DropdownCell;
