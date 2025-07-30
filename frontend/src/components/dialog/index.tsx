// TODO: refactoring to charkaUI
import ReactModal from "react-modal";
import * as ModalTypes from "@/types/components/modal";
import {
  Button,
  CloseButton,
  Dialog as CharkaDialog,
  Portal,
} from "@chakra-ui/react";

ReactModal.setAppElement("body");

const Dialog = (props: ModalTypes.Props) => {
  return (
    <CharkaDialog.Root
      open={props.open}
      size={"sm"}
      placement={props.placement || "center"}
    >
      <Portal>
        <CharkaDialog.Backdrop />
        <CharkaDialog.Positioner>
          <CharkaDialog.Content>
            {props.title && (
              <CharkaDialog.Header>
                <CharkaDialog.Title>CharkaDialog Title</CharkaDialog.Title>
              </CharkaDialog.Header>
            )}
            <CharkaDialog.Body>{props.children}</CharkaDialog.Body>
            {props.footer && (
              <CharkaDialog.Footer>
                <CharkaDialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </CharkaDialog.ActionTrigger>
                <Button>Save</Button>
              </CharkaDialog.Footer>
            )}
            {props.closeTrigger && (
              <CharkaDialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </CharkaDialog.CloseTrigger>
            )}
          </CharkaDialog.Content>
        </CharkaDialog.Positioner>
      </Portal>
    </CharkaDialog.Root>
  );
};

export default Dialog;
