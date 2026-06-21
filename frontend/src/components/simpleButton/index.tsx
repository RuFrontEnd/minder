import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as SimpleButtonTypes from "@/types/components/simpleButton";
import styles from "./SimpleButton.module.css";

const SimpleButton = (props: SimpleButtonTypes.Props) => {
  const statusStyleObj: any = {};
  if (props.disabled) {
    statusStyleObj.color = (tailwindColors.grey as any)["5"];
    statusStyleObj.cursor = "default";
    statusStyleObj.pointerEvents = "none";
  } else if (props.danger) {
    statusStyleObj.color = (tailwindColors.error as any)["500"];
  } else {
    statusStyleObj.color = (tailwindColors.info as any)["500"];
  }

  const sizeClass =
    props.size === SimpleButtonTypes.Size.sm
      ? styles.sizeSm
      : props.size === SimpleButtonTypes.Size.md
      ? styles.sizeMd
      : styles.sizeLg;

  return (
    <button
      tabIndex={-1}
      role={props.role}
      className={`${styles.root} ${sizeClass} ${props.className ? props.className : ""}`}
      style={statusStyleObj}
      onClick={props.disabled ? undefined : props.onClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {props.loading && (
        <ReactLoading
          className={styles.loadingMargin}
          type={"spin"}
          color={tailwindColors.info["500"]}
          height={20}
          width={20}
        />
      )}
      {props.text}
    </button>
  );
};

export default SimpleButton;
