"use client";
import * as TextareaTypes from "@/types/components/textarea";
import { Textarea as ChakraTextarea } from "@chakra-ui/react";

const Textarea = (props: TextareaTypes.Props) => {
  return (
    <ChakraTextarea
      id={props.id}
      className={props.className}
      role={props.role}
      aria-label={props.name}
      name={props.name}
      placeholder={props.placeholder}
      rows={props.rows}
      autoFocus={props.autoFocus}
      value={props.value ?? ""}
      onChange={props.onChange}
      onKeyDown={props.onKeyDown}
    />
  );
};

export default Textarea;