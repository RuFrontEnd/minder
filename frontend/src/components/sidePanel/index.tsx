import IconButton from "@/components/iconButton";
import Icon from "@/components/icon";
import { Drawer as CharkaDrawer, CloseButton } from "@chakra-ui/react";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import styles from "./index.module.css";

const SidePanel = (props: SidePanelTypes.Props) => {
  const navbarHeight = 64;

  const panelViewportStyle: React.CSSProperties = {
    top: `${navbarHeight}px`,
    height: `calc(100vh - ${navbarHeight}px)`,
  };

  const horizontalPositionStyle = (() => {
    return props.placement === "end" ? { right: "12px" } : { left: "12px" };
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
              className={
                props.placement === "end"
                  ? styles["switchButtonIcon--right"]
                  : styles["switchButtonIcon--left"]
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
};

export default SidePanel;
