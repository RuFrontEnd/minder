"use client";
import * as InputTypes from "@/types/components/input";
import styles from "./Input.module.css";
import { Field, Input as CharkaInput } from "@chakra-ui/react";

const Input = (props: InputTypes.Props) => {
  return (
    <div className={props.className}>
      <Field.Root required invalid={props.errorText ? true : false}>
        <Field.Label>
          {props.name} <Field.RequiredIndicator />
        </Field.Label>
        <CharkaInput
          type={props.type}
          placeholder={props.placeholder}
          onChange={props.onChange}
        />
        {props.helperText && (
          <Field.HelperText>{props.helperText}</Field.HelperText>
        )}
        {props.errorText && (
          <Field.ErrorText>{props.errorText}</Field.ErrorText>
        )}
      </Field.Root>
    </div>
  );
};

Input.defaultProps = {
  type: "value",
};

export default Input;
