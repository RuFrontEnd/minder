import { motion } from "framer-motion";

const SidePanel = (props: any) => {
  const {
    id,
    className,
    open,
    w,
    h,
    d = [],
    children,
    onClickSwitch
  } = props;

  return (
    <motion.div
      id={id}
      style={{
        width: w,
        height: h,
      }}
      className={`${className && className
        } fixed ${d[0] === 'b' ? 'bottom-0' : 'top-0'} ${d[1] === 'r' ? 'right-0' : 'left-0'} p-4 bg-white shadow-lg`}
      variants={{
        open: {
          x: '0%'
        },
        closed: {
          x: `${d === 'r' ? '100%' : '-100%'}`
        }
      }}
      initial={open ? "open" : "closed"}
      animate={open ? "open" : `closed`}
      transition={{ type: "easeInOut" }}
    >
      <div className="relative">
        {children}
        <div
          className="absolute top-[32px] right-[-48px] w-8 h-8 inline-flex items-center justify-center rounded-r-lg bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
          onClick={onClickSwitch}
        >
          <motion.div
            variants={{
              open: {
                rotate: 0
              },
              closed: {
                rotate: 180
              }
            }}
            initial={open ? "open" : "closed"}
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ type: "easeInOut" }}
          >
            <svg
              className="w-4 h-4 text-indigo-500 dark:text-white"
              aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SidePanel;