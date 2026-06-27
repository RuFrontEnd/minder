"use client";
import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import * as IconButtonTypes from "@/types/components/iconButton";

const IconButton = (props: IconButtonTypes.Props) => {
  return (
    <ChakraIconButton
      id={props.id}
      role={props.role}
      className={props.className}
      style={props.style}
      aria-label={props.ariaLabel}
      variant={props.variant}
      size={props.size}
      disabled={props.disabled}
      onClick={props.loading ? undefined : props.onClick}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {props.icon}
    </ChakraIconButton>
  );
};

IconButton.defaultProps = {
  variant: "solid",
  size: "md",
};

export default IconButton;
