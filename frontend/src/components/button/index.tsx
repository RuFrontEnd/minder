import { Button as ChakraButton } from "@chakra-ui/react";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";
import styles from "./Button.module.css";

const Button = (props: ButtonTypes.Props) => {
  return (
    <ChakraButton
      style={{
        color: props.color,
      }}
      id={props.id}
      role={props.role}
      className={props.className}
      variant={props.variant}
      size={props.size}
      onClick={props.loading ? undefined : props.onClick}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      // isLoading={!!props.loading}
      // loadingText={props.text}
      // isDisabled={props.disabled}
      // variant="solid"
    >
      {props.text}
    </ChakraButton>
  );
};

Button.defaultProps = {
  variant: "solid",
  size: "md",
};

export default Button;
