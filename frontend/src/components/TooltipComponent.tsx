import { Tooltip } from "react-tooltip";

export function TextTooltipComponent({
  children,
  className,
  value,
  onClick,
  place,
}: {
  children: any;
  className?: string;
  value: any;
  onClick?: any;
  place?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={`relative ${className}`}
        data-tooltip-id="text-tooltip"
        data-tooltip-content={value}
        onClick={onClick}
      >
        {children}
      </div>
      <Tooltip place={place ?? "top"} id="text-tooltip" />
    </>
  );
}
