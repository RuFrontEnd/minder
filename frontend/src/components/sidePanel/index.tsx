import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import { motion } from "framer-motion";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";

const SidePanel = (props: SidePanelTypes.Props) => {
  const {
    id,
    className,
    role,
    open,
    w,
    h,
    horizentalD = SidePanelTypes.HorizentalD.l,
    verticalD = SidePanelTypes.VerticalD.t,
    children,
    onClickSwitch,
  } = props;

  return (
    <motion.div
      id={id}
      role={role}
      style={{
        width: w,
        height: h,
      }}
      className={`${className ? className : ""} fixed 
      ${horizentalD === SidePanelTypes.HorizentalD.r ? "right-0" : "left-0"} 
      ${
        verticalD === SidePanelTypes.VerticalD.m
          ? "top-1/2"
          : SidePanelTypes.VerticalD.b
          ? "bottom-0"
          : "top-0"
      }`}
      variants={{
        open: {
          x: "0%",
          y: verticalD === SidePanelTypes.VerticalD.m ? "-50%" : "0%",
        },
        closed: {
          x: `${
            horizentalD === SidePanelTypes.HorizentalD.r
              ? "calc(100% - 16px)"
              : "calc(-100% + 16px)"
          }`,
          y: verticalD === SidePanelTypes.VerticalD.m ? "-50%" : "0%",
        },
      }}
      initial={open ? "open" : "closed"}
      animate={open ? "open" : `closed`}
      transition={{ duration: 0 }}
    >
      <div className="p-4 h-full">
        <div className="h-full relative text-grey-2 bg-white-500 shadow-md rounded-lg">
          {children}
          {onClickSwitch && (
            <div
              className={`absolute top-[32px] ${
                horizentalD === SidePanelTypes.HorizentalD.r
                  ? "left-[-8px] -translate-x-full"
                  : "right-[-8px] translate-x-full"
              } `}
              onClick={onClickSwitch}
            >
              <RoundButton
                outerRing={false}
                size={28}
                className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                content={
                  <Icon
                    className={`transform ${
                      horizentalD === SidePanelTypes.HorizentalD.r
                        ? open
                          ? `rotate-180`
                          : `rotate-0`
                        : open
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
  );
};

export default SidePanel;
