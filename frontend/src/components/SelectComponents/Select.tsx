import { Select } from "antd";
import { isEmpty } from "lodash";
import { CSSProperties } from "react";

type OptionType = {
  label: string;
  value: any;
  disabled?: boolean;
};

export default function OneSelectItem({
  options,
  placeholder,
  style,
  className,
  rootClassName,
  popupClassName,
  handleChange,
  selected,
  defaultValue
}: {
  options: OptionType[];
  placeholder?: string | React.ReactNode;
  style?: CSSProperties | undefined;
  className?: string;
  rootClassName?: string;
  popupClassName?: string;
  handleChange: any;
  selected?: any;
  defaultValue?: any
}) {
  return (
    <Select
      placeholder={placeholder}
      className={className ?? undefined}
      rootClassName={rootClassName ?? undefined}
      popupClassName={popupClassName ?? undefined}
      style={style ?? undefined}
      onChange={handleChange}
      options={options}
      value={selected}
      defaultValue={defaultValue}
      loading={isEmpty(options)}
      allowClear
    />
  );
}
