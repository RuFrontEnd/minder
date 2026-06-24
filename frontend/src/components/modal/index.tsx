"use client";
import {
  Button,
  CloseButton,
  Dialog,
  For,
  HStack,
  Portal,
} from "@chakra-ui/react";
import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import * as ModalTypes from "@/types/components/modal";
import { tailwindColors } from "@/variables/colors";
import styles from "./Modal.module.css";

const Modal = (props: ModalTypes.Props) => {
  // const onClose = () => {
  //   if (props.onClickX) props.onClickX();
  // };

  return (
    <Dialog.Root key={props.key} open={props.isOpen} placement={props.placement || "center"}>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
        // size={props.size}
        >
          Open
          {/* ({props.size}) */}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{props.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{props.children}</Dialog.Body>
            {props.footer && (
              <Dialog.Footer>
                {props.onCancel && (
                  <Dialog.ActionTrigger asChild>
                    <Button onClick={props.onCancel}>Cancel</Button>
                  </Dialog.ActionTrigger>
                )}
                {props.onOk && <Button onClick={props.onOk}>Save</Button>}
              </Dialog.Footer>
            )}
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

Modal.defaultProps = {
  mask: true,
  footer: true,
  placement: "center",
  size: "md"
};

export default Modal;
