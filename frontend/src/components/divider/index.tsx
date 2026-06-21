import * as DividerTypes from "@/types/components/divider";
import styles from "./Divider.module.css";

const Divider = (props: DividerTypes.Props) => {
  return (
    <div id={props.id} className={`${props.className}`}>
      <div
        style={{
          margin: `${props.margin?.y ? `${props.margin?.y}px` : "1rem"} ${`${
            props.margin?.x || 0
          }px`}`,
        }}
        className={styles.bar}
      >
        {!!props.text && (
          <p className={styles.text}>
            {props.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Divider;
