"use client";
import * as InputTypes from "@/types/components/input";
import styles from "./Input.module.css";
import { Field, Input as CharkaInput } from "@chakra-ui/react";

const Input = (props: InputTypes.Props) => {
  return (
    <Field.Root
      required
      invalid={props.errorText ? true : false}
      className={props.className}
    >
      {!props.hideLabel && (
        <Field.Label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>
            {props.name} <Field.RequiredIndicator />
          </span>
          {props.labelExtra && (
            <span
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {props.labelExtra}
            </span>
          )}
        </Field.Label>
      )}
      <CharkaInput
        aria-label={props.hideLabel ? props.name : undefined}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value ?? undefined}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
      />
      {props.helperText && (
        <Field.HelperText>{props.helperText}</Field.HelperText>
      )}
      {props.errorText && <Field.ErrorText>{props.errorText}</Field.ErrorText>}
    </Field.Root>
  );
};

Input.defaultProps = {
  type: "value",
};

export default Input;
