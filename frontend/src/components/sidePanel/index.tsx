import { AnimatePresence, motion } from "framer-motion";
import * as Atoms from "./SidePanelAtoms";

const SidePanel = (props: any) => {
  const {
    id,
    className,
    visible,
    title,
    width,
    height,
    xDirection,
    yDirection,
    zIndex,
    children,
    footer,
    bodyMargin,
    onCancel,
  } = props;

  return (
    <motion.div
      id={id}
      className={`${
        className && className
      } fixed top-[80px] right-0 h-[500px] w-[300px] bg-slate-200`}
      animate={{ x: visible ? "-20px" : "100%" }}
      transition={{ type: "easeInOut" }}
    >
      <div>{children}</div>
    </motion.div>
  );
};

export default SidePanel;
