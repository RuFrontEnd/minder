"use client";

import { NumberInput as ChakraNumberInput } from "@chakra-ui/react";
import * as NumberInputTypes from "@/types/components/numberInput";

const NumberInput = (props: NumberInputTypes.Props) => {
  return (
    <ChakraNumberInput.Root
      id={props.id}
      className={props.className}
      defaultValue={props.defaultValue}
      value={props.value}
      width={props.width}
      min={props.min}
      max={props.max}
      step={props.step}
      onValueChange={(details: any) => props.onValueChange?.(details.value)}
    >
      <ChakraNumberInput.Control />
      <ChakraNumberInput.Input />
    </ChakraNumberInput.Root>
  );
};

NumberInput.defaultProps = {
  defaultValue: "10",
  width: "200px",
};

export default NumberInput;
