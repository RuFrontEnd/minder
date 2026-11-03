"use client";
import { CloseButton as ChakraCloseButton } from "@chakra-ui/react";
import * as CloseButtonTypes from "@/types/components/closeButton";

const CloseButton = (props: CloseButtonTypes.Props) => (
  <ChakraCloseButton
    id={props.id}
    className={props.className}
    aria-label={props.ariaLabel}
    size={props.size}
    onClick={props.onClick}
  />
);

CloseButton.defaultProps = {
  size: "sm",
};

export default CloseButton;
