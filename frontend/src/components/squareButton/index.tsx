"use client";
import * as SquareButtonTypes from "@/types/components/squareButton";

const SquareButton = (props: SquareButtonTypes.Props) => {
  const size = {
    default: 24,
  };

  return (
    <button
      style={{
        width: props.size ? props.size : size.default,
        height: props.size ? props.size : size.default,
      }}
      className={`${
        props.className
      } inline-flex items-center justify-center flex-shrink-0 cursor-pointer rounded-lg bg-white-500 hover:bg-grey-5 ${
        props.shadow ? "shadow-md" : ""
      }`}
      tabIndex={props.tabIndex ? props.tabIndex : -1}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
    >
      {props.content}
    </button>
  );
};

export default SquareButton;
