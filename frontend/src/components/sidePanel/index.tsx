import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import { Drawer as CharkaDrawer, CloseButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import styles from "./SidePanel.module.css";

const SidePanel = (props: SidePanelTypes.Props) => {


  return (
    <CharkaDrawer.Root
      open={props.open}
      size={props.size}
      placement={props.placement}
      modal={props.modal}
      contained={false}
      onInteractOutside={props.onInteractOutside}
    >
      {props.modal && <CharkaDrawer.Backdrop />}
      <CharkaDrawer.Trigger />
      <CharkaDrawer.Positioner pointerEvents={props.modal ? undefined : "none"}>
        <CharkaDrawer.Content>
          <CharkaDrawer.CloseTrigger />
          <CharkaDrawer.Header top={`${64}px`} h={`calc(100vh - ${64}px)`}>
            <CharkaDrawer.Title>
              {props.title}
            </CharkaDrawer.Title>
          </CharkaDrawer.Header>
          <CharkaDrawer.Body>
            {props.children}
          </CharkaDrawer.Body>
          <CharkaDrawer.Footer />
          <CharkaDrawer.CloseTrigger asChild onClick={props.onCancel}>
            <CloseButton size="sm" />
          </CharkaDrawer.CloseTrigger>
        </CharkaDrawer.Content>
      </CharkaDrawer.Positioner>
    </CharkaDrawer.Root>
  );
};

SidePanel.defaultProps = {
  modal: false,
  flow: SidePanelTypes.Flow.row,
  switchButtonD: SidePanelTypes.SwitchButtonD.start,
};

export default SidePanel;
