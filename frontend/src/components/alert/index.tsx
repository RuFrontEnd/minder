import { Alert as ChakraAlert } from "@chakra-ui/react";
import * as AlertTypes from "@/types/components/alert";

const Alert = (props: AlertTypes.Props) => {
  if (!props.text) return null;

  const status =
    props.type === AlertTypes.Type.succeess
      ? "success"
      : props.type === AlertTypes.Type.warning
        ? "warning"
        : "error";

  return (
    <ChakraAlert.Root
      id={props.id}
      className={props.className}
      status={status}
      variant={props.variant ?? "subtle"}
      display="inline-flex"
      alignItems="center"
      fontSize="sm"
      fontWeight="medium"
    >
      <ChakraAlert.Indicator />
      <ChakraAlert.Description>{props.text}</ChakraAlert.Description>
    </ChakraAlert.Root>
  );
};

export default Alert;
