import { Button as ChakraButton } from "@chakra-ui/react";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";
import styles from "./Button.module.css";

const Button = (props: ButtonTypes.Props) => {

  return (
    <ChakraButton
      id={props.id}
      role={props.role}
      className={props.className}
      size={props.size}
      variant={props.variant}
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
  size: "md",
  variant: "solid", 
}

export default Button;
