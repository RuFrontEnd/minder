import { Button as ChakraButton } from "@chakra-ui/react";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";
import styles from "./Button.module.css";

const Button = (props: ButtonTypes.Props) => {
  const styleObj: React.CSSProperties = {
    ...(props.style || {}),
    color: props.color,
  };

  if (props.variant === "outline" && props.color) {
    // ensure outline border matches provided color
    styleObj.border = `1px solid ${props.color}`;
    styleObj.borderColor = props.color;
  }

  return (
    <ChakraButton
      style={styleObj}
      id={props.id}
      role={props.role}
      className={props.className}
      variant={props.variant}
      size={props.size}
      onClick={props.loading ? undefined : props.onClick}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
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
