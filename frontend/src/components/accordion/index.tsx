import * as AccordionTypes from "@/types/components/accordion";

export default function Accordion(props: AccordionTypes.Props) {
  const {
    className,
    title,
    open,
    children,
    onClickArrow,
    onClickTitle,
  } = props;

  return (
    <div className={`${className && className}`}>
      <div className="flex mb-1">
        <svg
          className={`${
            open ? "rotate-0" : "rotate-160"
          } w-6 h-6 text-gray-800 dark:text-white cursor-pointer`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          onClick={onClickArrow}
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m8 10 4 4 4-4"
          />
        </svg>

        <p className="cursor-pointer" onClick={onClickTitle}>
          {title}
        </p>
      </div>
      <div>
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out text-slate-600 ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
