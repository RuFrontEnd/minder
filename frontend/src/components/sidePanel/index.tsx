import IconButton from "@/components/iconButton";
import Icon from "@/components/icon";
import { Drawer as CharkaDrawer, CloseButton } from "@chakra-ui/react";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import styles from "./SidePanel.module.css";

const SidePanel = (props: SidePanelTypes.Props) => {
  const navbarHeight = 64;

  const isRightSwitchButton =
    props.switchButtonD === SidePanelTypes.SwitchButtonD.end;
  const isEndPlacement = props.placement === "end";

  const panelViewportStyle: React.CSSProperties = {
    top: `${navbarHeight}px`,
    height: `calc(100vh - ${navbarHeight}px)`,
  };

  const horizontalPositionStyle = (() => {
    if (isRightSwitchButton) {
      return { right: "12px" };
    }

    if (props.switchButtonD === SidePanelTypes.SwitchButtonD.m) {
      return { left: "50%", transform: "translateX(-50%)" };
    }

    return { left: "12px" };
  })();

  const switchButtonStyle: React.CSSProperties = {
    position: "fixed",
    top: "76px",
    zIndex: 60,
    ...horizontalPositionStyle,
  };

  return (
    <>
      {!props.open && props.onClickSwitch && (
        <IconButton
          ariaLabel="Open side panel"
          variant="solid"
          size="2xs"
          style={switchButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            props.onClickSwitch?.(e);
          }}
          icon={
            <Icon
              type={IconTypes.Type.arrowSolid}
              w={10}
              h={10}
              fill={tailwindColors.white["500"]}
              style={
                isEndPlacement ? { transform: "rotate(180deg)" } : undefined
              }
            />
          }
        />
      )}

      <CharkaDrawer.Root
        open={props.open}
        size={props.size}
        placement={props.placement}
        modal={props.modal}
        contained={false}
        onInteractOutside={props.onInteractOutside}
      >
        {props.modal && <CharkaDrawer.Backdrop style={panelViewportStyle} />}
        <CharkaDrawer.Trigger />
        <CharkaDrawer.Positioner
          style={panelViewportStyle}
          pointerEvents={props.modal ? undefined : "none"}
        >
          <CharkaDrawer.Content>
            <CharkaDrawer.CloseTrigger />
            <CharkaDrawer.Header top={`${64}px`} h={`calc(100vh - ${64}px)`}>
              <CharkaDrawer.Title>{props.title}</CharkaDrawer.Title>
            </CharkaDrawer.Header>
            <CharkaDrawer.Body>{props.children}</CharkaDrawer.Body>
            <CharkaDrawer.Footer />
            <CharkaDrawer.CloseTrigger asChild onClick={props.onCancel}>
              <CloseButton size="sm" />
            </CharkaDrawer.CloseTrigger>
          </CharkaDrawer.Content>
        </CharkaDrawer.Positioner>
      </CharkaDrawer.Root>
    </>
  );
};

SidePanel.defaultProps = {
  modal: false,
  flow: SidePanelTypes.Flow.row,
  switchButtonD: SidePanelTypes.SwitchButtonD.start,
};

export default SidePanel;
