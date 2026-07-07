"use client";
import { Flex } from "@chakra-ui/react";
import * as LineButtonTypes from "@/types/components/lineButton";

export default function LineButton(props: LineButtonTypes.Props) {
  return (
    <Flex justify="flex-end">
      <p>{props.text}</p>
      <p className={props.buttonClassName} onClick={props.onClick}>
        {props.buttonText}
      </p>
    </Flex>
  );
}
