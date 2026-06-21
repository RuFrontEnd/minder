import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import { motion } from "framer-motion";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import styles from "./SidePanel.module.css";

const SidePanel = (props: SidePanelTypes.Props) => {
  const switchButtonPositionStyle = {
    row: (() => {
      if (props.switchButtonD === SidePanelTypes.SwitchButtonD.start) {
        return { top: 16 };
      } else if (props.switchButtonD === SidePanelTypes.SwitchButtonD.m) {
        return { top: "50%", transform: "translateY(-50%)" } as any;
      } else if (props.switchButtonD === SidePanelTypes.SwitchButtonD.end) {
        return { bottom: 16 };
      }

      return { top: 16 };
    })(),
    column: (() => {
      if (props.switchButtonD === SidePanelTypes.SwitchButtonD.start) {
        return { left: 16 };
      } else if (props.switchButtonD === SidePanelTypes.SwitchButtonD.m) {
        return { left: "50%", transform: "translateX(-50%)" } as any;
      } else if (props.switchButtonD === SidePanelTypes.SwitchButtonD.end) {
        return { right: 16 };
      }

      return { left: 16 };
    })(),
  };
  return (
    <>
      {props.flow === SidePanelTypes.Flow.row && (
        <motion.div
          id={props.id}
          role={props.role}
          style={{
            width: props.w,
            height: props.h,
          }}
          className={`${props.className || ""} ${styles.root}`}
          style={{
            ...(props.horizentalD === SidePanelTypes.HorizentalD.r
              ? { right: 0 }
              : { left: 0 }),
            ...(props.verticalD === SidePanelTypes.VerticalD.m
              ? { top: "50%", transform: "translateY(-50%)" }
              : props.verticalD === SidePanelTypes.VerticalD.b
              ? { bottom: 0 }
              : { top: 0 }),
          }}
          variants={{
            open: {
              x: "0%",
              y: props.verticalD === SidePanelTypes.VerticalD.m ? "-50%" : "0%",
            },
            closed: {
              x: `${
                props.horizentalD === SidePanelTypes.HorizentalD.r
                  ? "calc(100% - 16px)"
                  : "calc(-100% + 16px)"
              }`,
              y: props.verticalD === SidePanelTypes.VerticalD.m ? "-50%" : "0%",
            },
          }}
          initial={props.open ? "open" : "closed"}
          animate={props.open ? "open" : `closed`}
          transition={{ duration: 0 }}
        >
          <div className={styles.innerPadding}>
            <div
              className={styles.panelBox}
              style={{
                ["--border-color" as any]: tailwindColors.grey["5"],
                ["--bg-color" as any]: tailwindColors.white["500"],
                ["--text-color" as any]: tailwindColors.grey["2"],
              } as React.CSSProperties}
            >
              {props.children}
              {props.onClickSwitch && (
                <div
                  className={styles.switchWrapper}
                  style={{
                    ...(switchButtonPositionStyle.row as any),
                    ...(props.horizentalD === SidePanelTypes.HorizentalD.r
                      ? { right: "100%", marginRight: 16 }
                      : { left: "100%", marginLeft: 16 }),
                  } as React.CSSProperties}
                  onClick={props.onClickSwitch}
                >
                  <RoundButton
                    outerRing={false}
                    size={28}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                    content={
                      <Icon
                        className={`transform ${
                          props.horizentalD === SidePanelTypes.HorizentalD.r
                            ? props.open
                              ? `rotate-180`
                              : `rotate-0`
                            : props.open
                            ? `rotate-0`
                            : `rotate-180`
                        } `}
                        type={IconTypes.Type.arrowSolid}
                        w={12}
                        h={12}
                        fill={tailwindColors.white["500"]}
                      />
                    }
                    differece={16}
                    onKeyDown={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {props.flow === SidePanelTypes.Flow.column && (
        <motion.div
          id={props.id}
          role={props.role}
          style={{
            width: props.w,
            height: props.h,
          }}
          className={`${props.className || ""} ${styles.root}`}
          style={{
            ...(props.horizentalD === SidePanelTypes.HorizentalD.m
              ? { left: "50%", transform: "translateX(-50%)" }
              : props.horizentalD === SidePanelTypes.HorizentalD.r
              ? { right: 0 }
              : { left: 0 }),
            ...(props.verticalD === SidePanelTypes.VerticalD.m
              ? { top: "50%", transform: "translateY(-50%)" }
              : props.verticalD === SidePanelTypes.VerticalD.b
              ? { bottom: 0 }
              : { top: 0 }),
          }}
          variants={{
            open: {
              x:
                props.horizentalD === SidePanelTypes.HorizentalD.m
                  ? "-50%"
                  : "0%",
              y: "0%",
            },
            closed: {
              x:
                props.horizentalD === SidePanelTypes.HorizentalD.m
                  ? "-50%"
                  : "0%",
              y: `${
                props.verticalD === SidePanelTypes.VerticalD.b
                  ? "calc(100% - 16px)"
                  : "calc(-100% + 16px)"
              }`,
            },
          }}
          initial={props.open ? "open" : "closed"}
          animate={props.open ? "open" : `closed`}
          transition={{ duration: 0 }}
        >
          <div className={styles.innerPadding}>
            <div
              className={styles.panelBox}
              style={{
                ["--border-color" as any]: tailwindColors.grey["5"],
                ["--bg-color" as any]: tailwindColors.white["500"],
                ["--text-color" as any]: tailwindColors.grey["2"],
              } as React.CSSProperties}
            >
              {props.children}
              {props.onClickSwitch && (
                <div
                  className={styles.switchWrapper}
                  style={{
                    ...(switchButtonPositionStyle.column as any),
                    ...(props.verticalD === SidePanelTypes.VerticalD.b
                      ? { bottom: "100%", marginBottom: 16 }
                      : { top: "100%", marginTop: 16 }),
                  } as React.CSSProperties}
                  onClick={props.onClickSwitch}
                >
                  <RoundButton
                    outerRing={false}
                    size={28}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                    content={
                      <Icon
                        className={`transform ${
                          props.verticalD === SidePanelTypes.VerticalD.b
                            ? props.open
                              ? `rotate-90`
                              : `-rotate-90`
                            : props.open
                            ? `-rotate-90`
                            : `rotate-90`
                        } `}
                        type={IconTypes.Type.arrowSolid}
                        w={12}
                        h={12}
                        fill={tailwindColors.white["500"]}
                      />
                    }
                    differece={16}
                    onKeyDown={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

SidePanel.defaultProps = {
  flow: SidePanelTypes.Flow.row,
  switchButtonD: SidePanelTypes.SwitchButtonD.start,
  horizentalD: SidePanelTypes.HorizentalD.l,
  verticalD: SidePanelTypes.VerticalD.t,
};

export default SidePanel;
