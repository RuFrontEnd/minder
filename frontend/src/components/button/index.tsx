import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";
import styles from "./Button.module.css";

const Button = (props: ButtonTypes.Props) => {
  const statusStyleObj: any = {};
  if (props.disabled) {
    statusStyleObj.backgroundColor = tailwindColors.grey["5"];
    statusStyleObj.cursor = "default";
  } else if (props.danger) {
    statusStyleObj.backgroundColor = tailwindColors.error["500"];
    statusStyleObj.color = tailwindColors.white["500"];
  } else if (props.info) {
    statusStyleObj.backgroundColor = tailwindColors.info["500"];
    statusStyleObj.color = tailwindColors.white["500"];
  } else if (props.vice) {
    statusStyleObj.backgroundColor = tailwindColors.secondary["500"];
    statusStyleObj.color = tailwindColors["black"]["2"];
  } else {
    statusStyleObj.backgroundColor = tailwindColors.primary["500"];
    statusStyleObj.color = tailwindColors.white["500"];
  }

  const sizeClass =
    props.size === ButtonTypes.Size["sm"] ? styles.sizeSm : styles.sizeMd;

  return (
    <button
      tabIndex={-1}
      id={props.id}
      role={props.role}
      className={`${styles.root} ${sizeClass} ${props.className ? props.className : ""}`}
      style={statusStyleObj}
      onClick={props.loading ? undefined : props.onClick}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {props.loading && (
        <ReactLoading
          className={styles.loadingMargin}
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
