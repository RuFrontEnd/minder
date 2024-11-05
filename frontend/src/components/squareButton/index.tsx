"use client";
import * as SquareButtonTypes from "@/types/components/squareButton";

const SquareButton = (props: SquareButtonTypes.Props) => {
  const size = {
    default: 24,
  };

  const borderRadiusStyle = (() => {
    if (props.part === SquareButtonTypes.Part.independent) {
      return 'rounded-lg'
    }

    if (props.part === SquareButtonTypes.Part.left) {
      return 'rounded-l-lg'
    }

    if (props.part === SquareButtonTypes.Part.middle) {
      return ''
    }

    if (props.part === SquareButtonTypes.Part.right) {
      return 'rounded-r-lg'
    }

    return 'rounded-lg'
  })()

  return (
    <button
      style={{
        width: props.w ? props.w : props.size ? props.size : size.default,
        height: props.h ? props.h : props.size ? props.size : size.default,
      }}
      className={`${props.className
        } text-grey-1 inline-flex items-center justify-center flex-shrink-0 cursor-pointer ${borderRadiusStyle} bg-white-500 hover:bg-grey-5 ${props.shadow ? "shadow-md" : ""
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
