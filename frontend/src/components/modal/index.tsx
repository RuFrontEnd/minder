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
    <Dialog.Root key={props.key} open={props.isOpen}>
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
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
    // <ChakraModal isOpen={!!props.isOpen} onClose={onClose} isCentered>
    //   <ModalOverlay
    //     bg={props.mask ? "rgba(0, 0, 0, 0.5)" : "transparent"}
    //     zIndex={props.zIndex || 1000}
    //   />

    //   <ModalContent
    //     width={props.width || "auto"}
    //     bg="transparent"
    //     boxShadow="none"
    //     border="none"
    //     p={0}
    //   >
    //     <div className={styles.container}>
    //       {props.onClickX && (
    //         <RoundButton
    //           className={styles.closeAbsolute}
    //           onClick={props.onClickX}
    //           content={<Icon stroke={tailwindColors.white["500"]} />}
    //         />
    //       )}

    //       {props.children}
    //     </div>
    //   </ModalContent>
    // </ChakraModal>
  );
};

Modal.defaultProps = {
  mask: true,
};

export default Modal;
