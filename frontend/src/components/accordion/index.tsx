import * as AccordionTypes from "@/types/components/accordion";
import * as IconTypes from "@/types/components/icon";
import Icon from "@/components/icon"
import RoundButton from "@/components/roundButton"

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
    <div className={className} onClick={onClick}>
      <div className="px-4 py-2 cursor-pointer hover:bg-grey-5 hover:bg-opacity-50 group">
        <div className="flex flex-1">
          {showArrow && (
            <Icon type={IconTypes.Type.arrowLeft} className={`${open ? "rotate-0" : "rotate-[-90deg]"
              } text-primary-500 duration-300 start-0 items-center`} w={24} h={24} />
          )}
          <p className="text-primary-500 text-lg flex-1 break-all">{title}</p>
          <div className="flex items-center">
            <div className="opacity-0 group-hover:opacity-100">
              {hoverRender}
            </div>
          </div>
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
