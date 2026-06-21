"use client";
import * as SelectTypes from "@/types/components/select";
import styles from "./Select.module.css";

const Select = (props: SelectTypes.Props) => {
  const textColor = (() => {
    if (props.status === SelectTypes.Status.warning) {
      return "text-warning-500";
    } else if (props.status === SelectTypes.Status.error) {
      return "text-error-500";
    } else {
      return "text-grey-2";
    }
  })(),
    borderColor = (() => {
      if (props.status === SelectTypes.Status.warning) {
        return "border-warning-500 focus:border-warning-500";
      } else if (props.status === SelectTypes.Status.error) {
        return "border-error-500 focus:border-error-500";
      } else {
        return "border-grey-4 focus:border-primary-500";
      }
    })();

  return (
    <div className={props.className} id={props.id}>
      {props.label && (
        <label htmlFor={props.name} className={styles.label}>
          {props.label}
        </label>
      )}
      <select
        style={{
          width: props.w ? props.w : "100%",
          height: props.h ? props.h : 32,
          ["--border-color" as any]:
            props.status === SelectTypes.Status.warning
              ? (tailwindColors.warning as any)["500"]
              : props.status === SelectTypes.Status.error
              ? (tailwindColors.error as any)["500"]
              : (tailwindColors.grey as any)["4"],
        } as React.CSSProperties}
        name={props.name}
        className={styles.select}
        value={props.value || ""}
        onChange={props.onChange}
        placeholder={props.placeholder}
      >
        {props.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {props.comment && <p className={styles.comment}>{props.comment}</p>}
    </div>
  );
};

export default Select;
