import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData,
}) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => updateMyData(index, id, value), [value]);
  const onChange = (event) => setValue(event.target.value);
  return <Input value={value} onChange={onChange} />;
};

export default EditableCell;
