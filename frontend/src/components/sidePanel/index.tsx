import IconButton from "@/components/iconButton";
import Icon from "@/components/icon";
import { Drawer as CharkaDrawer } from "@chakra-ui/react";
import CloseButton from "@/components/closeButton";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import styles from "./index.module.css";

const SidePanel = (props: SidePanelTypes.Props) => {
  const navbarHeight = 56;

  const panelPositionStyle = (() => {
    return props.placement === "end"
      ? { right: "12px" }
      : { left: "0" };
  })();

  const panelViewportStyle: React.CSSProperties = {
    top: `${navbarHeight}px`,
    height: `calc(100vh - ${navbarHeight}px)`,
    ...panelPositionStyle,
  };

  const switchButtonStyle: React.CSSProperties = {
    position: "fixed",
    top: "68px",
    zIndex: 60,
    ...(props.placement === "end" ? { right: "12px" } : { left: "12px" }),
  };

  const onInteractOutside = (event: any) => {
    const target = event?.target;

    if (target instanceof Element && target.closest("[data-side-panel-root]")) {
      return;
    }

    props.onInteractOutside?.(event);
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
        onInteractOutside={onInteractOutside}
      >
        {props.modal && <CharkaDrawer.Backdrop style={panelViewportStyle} />}
        <CharkaDrawer.Trigger />
        <CharkaDrawer.Positioner
          style={panelViewportStyle}
          pointerEvents={props.modal ? undefined : "none"}
        >
          <CharkaDrawer.Content
            className={props.className}
            data-side-panel-root
          >
            {!props.hideHeader && (
              <CharkaDrawer.Header
                top={`${navbarHeight}px`}
                h={`calc(100vh - ${navbarHeight}px)`}
              >
                <CharkaDrawer.Title>{props.title}</CharkaDrawer.Title>
              </CharkaDrawer.Header>
            )}
            <CharkaDrawer.Body className={styles.body}>
              {props.children}
            </CharkaDrawer.Body>
            {props.footer !== false && <CharkaDrawer.Footer />}
            {!props.hideHeader && (
              <CharkaDrawer.CloseTrigger asChild onClick={props.onCancel}>
                <CloseButton
                  ariaLabel="Close side panel"
                  size="sm"
                />
              </CharkaDrawer.CloseTrigger>
            )}
          </CharkaDrawer.Content>
        </CharkaDrawer.Positioner>
      </CharkaDrawer.Root>
    </>
  );
};

SidePanel.defaultProps = {
  modal: false,
  flow: SidePanelTypes.Flow.row,
  footer: true,
};

export default SidePanel;
