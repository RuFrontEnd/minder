import { AnimatePresence, motion } from "framer-motion";
import * as Atoms from "./SidePanelAtoms";

const SidePanel = (props: any) => {
  const {
    id,
    className,
    visible,
    w,
    h,
    d = [],
    zIndex,
    children,
    footer,
    bodyMargin,
    onCancel,
  } = props;

  return (
    <motion.div
      id={id}
      style={{
        width: w,
        height: h,
      }}
      className={`${className && className
        } fixed ${d[0] === 'b' ? 'bottom-0' : 'top-0'} ${d[1] === 'r' ? 'right-0' : 'left-0'} bg-white shadow-lg`}
      animate={{ x: visible ? "0%" : `${d === 'r' ? '100%' : '-100%'}` }}
      transition={{ type: "easeInOut" }}
    >
    </motion.div>
  );
};

export default SidePanel;
