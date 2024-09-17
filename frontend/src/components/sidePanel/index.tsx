import { motion } from "framer-motion";

const SidePanel = (props: any) => {
  const { id, className, open, w, h, d = [], children, onClickSwitch } = props;

  return (
    <motion.div
      id={id}
      style={{
        width: w,
        height: h,
      }}
      className={`${className ? className : ""} bg-white-500 fixed ${
        d[0] === "b" ? "bottom-0" : "top-0"
      } ${d[1] === "r" ? "right-0" : "left-0"} shadow-md`}
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
      <div className="relative h-full text-grey-2">
        {children}
        {onClickSwitch && (
          <div
            className={`absolute top-[32px] ${
              d[1] === "r" ? "left-[-12px]" : "right-[-12px]"
            } ${
              d[1] === "r" ? "-translate-x-full" : "translate-x-full"
            } w-10 h-10 inline-flex items-center justify-center rounded-${
              d[1] === "r" ? "l" : "r"
            }-lg bg-white-500 flex-shrink-0 cursor-pointer rounded-full shadow-md`}
          >
            <div
              className={`w-6 h-6 inline-flex items-center justify-center rounded-${
                d[1] === "r" ? "l" : "r"
              }-lg bg-primary-500 flex-shrink-0 cursor-pointer rounded-full`}
              onClick={onClickSwitch}
            >
              <motion.div
                variants={{
                  open: {
                    rotate: d[1] === "r" ? 180 : 0,
                  },
                  closed: {
                    rotate: d[1] === "r" ? 0 : 180,
                  },
                }}
                initial={open ? "open" : "closed"}
                animate={{
                  rotate: open
                    ? (() => {
                        return d[1] === "r" ? 180 : 0;
                      })()
                    : (() => {
                        return d[1] === "r" ? 0 : 180;
                      })(),
                }}
                transition={{ type: "easeInOut" }}
              >
                <svg
                  className="w-6 h-6 text-white-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m14 8-4 4 4 4"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SidePanel;
