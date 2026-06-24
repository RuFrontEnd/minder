"use client";
import {
  CloseButton,
  Dialog,
  For,
  HStack,
  Portal,
} from "@chakra-ui/react";
import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import * as ModalTypes from "@/types/components/modal";
import Button from '@/components/button';
import { tailwindColors } from "@/variables/colors";
import styles from "./Modal.module.css";

const Modal = (props: ModalTypes.Props) => {
  // const onClose = () => {
  //   if (props.onClickX) props.onClickX();
  // };

  return (
    <Dialog.Root key={props.key} open={props.isOpen} placement={props.placement || "center"}>
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
                    <Button text={props.cancelText || "Cancel"} onClick={props.onCancel} variant="outline" />
                  </Dialog.ActionTrigger>
                )}
                {props.onOk && <Button text={props.okText || "Save"} onClick={props.onOk} />}
              </Dialog.Footer>
            )}
            {props.onCancel &&
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" onClick={props.onCancel} />
              </Dialog.CloseTrigger>
            }
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
