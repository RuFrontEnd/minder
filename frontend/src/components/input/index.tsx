"use client";
import * as InputTypes from "@/types/components/input";

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
        <label
          htmlFor={props.name}
          className={`leading-7 text-md text-grey-2 ms-1 duration-200 ease-in-out`}
        >
          {props.label}
        </label>
      )}
      <input
        style={{
          width: props.w ? props.w : "100%",
          height: props.h ? props.h : 32,
        }}
        placeholder={props.placeholder}
        type={props.type}
        name={props.name}
        className={`bg-white-500 rounded border ${borderColor} text-base outline-none text-grey-2 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
        value={props.value || ""}
        onChange={props.onChange}
      />
      {props.comment && (
        <p className={`${textColor} text-sm ms-1 mt-1`}>{props.comment}</p>
      )}
    </div>
  );
};

export default Input;
