"use client";
import { Dialog, For, HStack } from "@chakra-ui/react";
import Portal from "@/components/portal";
import CloseButton from "@/components/closeButton";
import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import * as ModalTypes from "@/types/components/modal";
import Button from "@/components/button";
import { tailwindColors } from "@/variables/colors";
import styles from "./Modal.module.css";

const Modal = (props: ModalTypes.Props) => {
  // const onClose = () => {
  //   if (props.onClickX) props.onClickX();
  // };

  return (
    <Dialog.Root
      key={props.key}
      open={props.isOpen}
      placement={props.placement || "center"}
      onOpenChange={({ open }) => {
        if (!open) props.onClose?.();
      }}
    >
      <Portal>
        <Dialog.Backdrop className={props.backdropClassName} />
        <Dialog.Positioner className={props.positionerClassName}>
          <Dialog.Content
            id={props.id}
            className={props.className}
            style={props.style}
          >
            {props.title && (
              <Dialog.Header>
                <Dialog.Title>{props.title}</Dialog.Title>
              </Dialog.Header>
            )}
            <Dialog.Body className={props.bodyClassName}>
              {props.children}
            </Dialog.Body>
            {props.footer && (
              <Dialog.Footer>
                {props.showCancelButton && (
                  <Dialog.ActionTrigger asChild>
                    <Button
                      text={props.cancelText}
                      onClick={props.onCancel}
                      variant="outline"
                    />
                  </Dialog.ActionTrigger>
                )}
                {props.onOk && (
                  <Button text={props.okText || "Save"} onClick={props.onOk} />
                )}
              </Dialog.Footer>
            )}
            {props.onCancel && (
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  ariaLabel="Close dialog"
                  size="sm"
                  onClick={props.onCancel}
                />
              </Dialog.CloseTrigger>
            )}
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
  size: "md",
  cancelText: "Cancel",
  showCancelButton: false,
  showFooter: true,
};

export default Modal;
