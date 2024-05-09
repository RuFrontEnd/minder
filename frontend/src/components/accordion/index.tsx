import * as AccordionTypes from "@/types/components/accordion";

export default function Accordion(props: AccordionTypes.Props) {
  const {
    className,
    title,
    open,
    children,
    hoverRender,
    showArrow = true,
    onClick,
  } = props;

  return (
    <div className={`${className && className}`} onClick={onClick}>
      <div className="ps-[24px] flex items-center mb-1 cursor-pointer hover:bg-grey-5 hover:bg-opacity-50 relative">
        {showArrow &&
          <svg
            className={`${open ? "rotate-0" : "rotate-[-90deg]"
              } w-6 h-6 text-primary-500 duration-300 absolute start-0`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m8 10 4 4 4-4"
            />
          </svg>
        }

        <div className="flex items-center flex-1 group">
          <div className="text-primary-500">
            {title}
          </div>
          <div className="flex-1 hidden group-hover:block">{hoverRender}</div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out text-slate-600 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden text-grey-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
