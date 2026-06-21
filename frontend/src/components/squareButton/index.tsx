"use client";
import * as SquareButtonTypes from "@/types/components/squareButton";
import styles from "./SquareButton.module.css";

const SquareButton = (props: SquareButtonTypes.Props) => {
  const size = {
    default: 24,
  };

  const borderRadiusClass = (() => {
    if (props.part === SquareButtonTypes.Part.independent) {
      return styles.roundedLg;
    }

    if (props.part === SquareButtonTypes.Part.left) {
      return styles.roundedLeft;
    }

    if (props.part === SquareButtonTypes.Part.middle) {
      return "";
    }

    if (props.part === SquareButtonTypes.Part.right) {
      return styles.roundedRight;
    }

    return styles.roundedLg;
  })();

  return (
    <button
      role={props.role}
      style={{
        width: props.w ? props.w : props.size ? props.size : size.default,
        height: props.h ? props.h : props.size ? props.size : size.default,
      }}
      className={`${styles.root} ${borderRadiusClass} ${props.className ? props.className : ""} ${
        props.shadow ? "shadow-md" : ""
      }`}
      tabIndex={props.tabIndex ? props.tabIndex : -1}
      onClick={props.onClick}
      onKeyDown={(e) => {
        e.preventDefault();
        return false;
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {props.content}
    </button>
  );
};

export default SquareButton;
