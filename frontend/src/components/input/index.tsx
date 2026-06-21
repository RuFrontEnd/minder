"use client";
import * as InputTypes from "@/types/components/input";
import styles from "./Input.module.css";

const Input = (props: InputTypes.Props) => {
  const textColor = (() => {
    if (props.status === InputTypes.Status.warning) {
      return "text-warning-500";
    } else if (props.status === InputTypes.Status.error) {
      return "text-error-500";
    } else {
      return "text-grey-2";
    }
  })(),
    borderColor = (() => {
      if (props.status === InputTypes.Status.warning) {
        return "border-warning-500 focus:border-warning-500";
      } else if (props.status === InputTypes.Status.error) {
        return "border-error-500 focus:border-error-500";
      } else {
        return "border-grey-4 focus:border-primary-500";
      }
    })();

  return (
    <div className={props.className} id={props.id} role={props.role}>
      {props.label && (
        <label htmlFor={props.name} className={styles.label}>
          {props.label}
        </label>
      )}
      <input
        style={{
          width: props.w ? props.w : "100%",
          height: props.h ? props.h : 32,
          ["--border-color" as any]:
            props.status === InputTypes.Status.warning
              ? (tailwindColors.warning as any)["500"]
              : props.status === InputTypes.Status.error
              ? (tailwindColors.error as any)["500"]
              : (tailwindColors.grey as any)["4"],
          ["--bg-color" as any]: (tailwindColors.white as any)["500"],
          ["--text-color" as any]: (tailwindColors.grey as any)["2"],
        } as React.CSSProperties}
        placeholder={props.placeholder}
        type={props.type}
        name={props.name}
        className={styles.input}
        value={props.value || ""}
        onChange={props.onChange}
      />
      {props.comment && (
        <p className={styles.comment}>{props.comment}</p>
      )}
    </div>
  );
};

export default Input;
