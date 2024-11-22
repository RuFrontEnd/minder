import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import { motion } from "framer-motion";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";

const SidePanel = (props: SidePanelTypes.Props) => {
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
          className={`${props.className || ""} fixed 
      ${
        props.horizentalD === SidePanelTypes.HorizentalD.r
          ? "right-0"
          : "left-0"
      } 
      ${
        props.verticalD === SidePanelTypes.VerticalD.m
          ? "top-1/2"
          : props.verticalD === SidePanelTypes.VerticalD.b
          ? "bottom-0"
          : "top-0"
      }`}
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
          <div className="p-4 h-full">
            <div className="h-full relative text-grey-2 bg-white-500 shadow-md rounded-lg">
              {props.children}
              {props.onClickSwitch && (
                <div
                  className={`absolute top-[128px] ${
                    props.horizentalD === SidePanelTypes.HorizentalD.r
                      ? "left-[-8px] -translate-x-full"
                      : "right-[-8px] translate-x-full"
                  } `}
                  onClick={props.onClickSwitch}
                >
                  <RoundButton
                    outerRing={false}
                    size={28}
                    className="m-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
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
          className={`${props.className || ""} fixed 
      ${
        props.horizentalD === SidePanelTypes.HorizentalD.m
          ? "left-1/2"
          : props.horizentalD === SidePanelTypes.HorizentalD.r
          ? "right-0"
          : "left-0"
      } 
      ${
        props.verticalD === SidePanelTypes.VerticalD.m
          ? "top-1/2"
          : props.verticalD === SidePanelTypes.VerticalD.b
          ? "bottom-0"
          : "top-0"
      }`}
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
          <div className="p-4 h-full">
            <div className="h-full relative text-grey-2 bg-white-500 shadow-md rounded-lg">
              {props.children}
              {props.onClickSwitch && (
                <div
                  className={`absolute left-[128px] ${
                    props.verticalD === SidePanelTypes.VerticalD.b
                      ? "top-[-8px] -translate-y-full"
                      : "bottom-[-8px] translate-y-full"
                  } `}
                  onClick={props.onClickSwitch}
                >
                  <RoundButton
                    outerRing={false}
                    size={28}
                    className="m-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
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
  horizentalD: SidePanelTypes.HorizentalD.l,
  verticalD: SidePanelTypes.VerticalD.t,
};

export default SidePanel;
