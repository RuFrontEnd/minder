import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";

const Button = (props: ButtonTypes.Props) => {
  const statusStyle = (() => {
    if (props.disabled) {
      return "bg-grey-5 cursor-default";
    }
    if (props.danger) {
      return "bg-error-500";
    }
    return props.info
      ? "text-white-500 bg-info-500"
      : props.vice
      ? "text-black-2 bg-secondary-500"
      : "text-white-500 bg-primary-500";
  })();

  const sizeStyle = (() => {
    const defaultStyle = "text-md px-6 py-2";

    if (props.size === ButtonTypes.Size["sm"]) {
      return "text-sm px-3 py-1";
    }

    if (props.size === ButtonTypes.Size["md"]) {
      return defaultStyle;
    }

    return defaultStyle;
  })();

  return (
    <button
      tabIndex={-1}
      id={props.id}
      role={props.role}
      className={`${statusStyle} ${sizeStyle} whitespace-nowrap flex justify-center items-center border-0 focus:outline-none rounded break-keep ${
        props.className && props.className
      }`}
      onClick={props.loading ? undefined : props.onClick}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {props.loading && (
        <ReactLoading
          className={"mr-2"}
          type={"spin"}
          color={tailwindColors.white["500"]}
          height={20}
          width={20}
        />
      )}
      {props.text}
    </button>
  );
};

export default Button;
