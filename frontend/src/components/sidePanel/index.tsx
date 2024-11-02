import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
import { motion } from "framer-motion";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";

const SidePanel = (props: any) => {
  const { id, className, open, w, h, d = [], children, onClickSwitch } = props;

  return (
    <motion.div
      id={id}
      style={{
        width: w,
        height: h,
      }}
      className={`${className ? className : ""} fixed ${d[0] === "b" ? "bottom-0" : "top-0"
        } ${d[1] === "r" ? "right-0" : "left-0"}`}
      variants={{
        open: {
          x: "0%",
        },
        closed: {
          x: `${d[1] === "r" ? "100%" : "-100%"}`,
        },
      }}
      initial={open ? "open" : "closed"}
      animate={open ? "open" : `closed`}
      transition={{ type: "easeInOut" }}
    >
      <div className="p-4 h-full">
        <div className="h-full relative text-grey-2 bg-white-500 shadow-md rounded-lg">
          {children}
          {onClickSwitch && (
            <div
              className={`absolute top-[32px] ${d[1] === "r" ? "left-[-4px]" : "right-[-4px]"
                } ${d[1] === "r" ? "-translate-x-full" : "translate-x-full"
                }`}
              onClick={onClickSwitch}
            >
              <RoundButton
                outerRing={false}
                size={28}
                className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                content={
                  <Icon
                    className={`transform ${d[1] === "r" ? open ? `rotate-180` : `rotate-0` : open ? `rotate-0` : `rotate-180`}`}
                    type={IconTypes.Type.arrowSolid}
                    w={12}
                    h={12}
                    fill={tailwindColors.white["500"]}
                  />
                }
                differece={16}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SidePanel;
