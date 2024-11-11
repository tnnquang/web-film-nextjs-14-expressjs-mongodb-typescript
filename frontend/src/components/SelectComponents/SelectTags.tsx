
import { Select } from "antd";


export const SelectTags = ({
  setSelected,
  selected = undefined,
  placeholder,
  data,
  customHeight,
}: {
  setSelected: any;
  selected?: any
  placeholder?: string;
  data?: any;
  customHeight?: string | number;
}) => {


  const handleChange = (
    value: any,
  ) => {
    setSelected(value);
  };
  

  return (
    <Select
      mode="tags"
      style={{ width: "100%", height: customHeight ?? 80 }}
      placeholder={placeholder ?? "Chọn thể loại"}
      onChange={handleChange}
      options={data}
      value={selected}
    />
  );
};
