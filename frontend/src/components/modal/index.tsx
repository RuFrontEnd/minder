// TODO: refactoring to charkaUI
import ReactModal from "react-modal";
import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import * as ModalTypes from "@/types/components/modal";
import { tailwindColors } from "@/variables/colors";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";

ReactModal.setAppElement("body");

const Modal = (props: ModalTypes.Props) => {
  return (
    <Dialog.Root open={props.open}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </Dialog.Body>
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
    // <ReactModal
    //   isOpen={props.isOpen}
    //   style={{
    //     overlay: {
    //       backgroundColor: props.mask ? "rgba(0, 0, 0, 0.5)" : "none",
    //       zIndex: props.zIndex || "1000",
    //     },
    //     content: {
    //       width: (props.width && props.width) || "auto",
    //       top: "50%",
    //       left: "50%",
    //       right: "auto",
    //       bottom: "auto",
    //       marginRight: "-50%",
    //       padding: 0,
    //       transform: "translate(-50%, -50%)",
    //       backgroundColor: "rgba(0, 0, 0, 0)",
    //       border: "none",
    //     },
    //   }}
    //   contentLabel="Example Modal"
    // >
    //   <div className="relative p-6">
    //     {props.onClickX && (
    //       <RoundButton
    //         outerRing
    //         className={"absolute top-[0px] right-[0px]"}
    //         onClick={props.onClickX}
    //         content={<Icon stroke={tailwindColors.white["500"]} />}
    //       />
    //     )}

    //     {props.children}
    //   </div>
    // </ReactModal>
  );
};

Modal.defaultProps = {
  mask: true,
};

export default Modal;
