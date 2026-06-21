import * as AccordionTypes from "@/types/components/accordion";
import * as IconTypes from "@/types/components/icon";
import Icon from "@/components/icon";
import styles from "./Accordion.module.css";

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
      <div className={styles.header}>
        <div className={styles.row}>
          {showArrow && (
            <Icon
              type={IconTypes.Type.arrow}
              className={`${styles.rotate} ${open ? "" : styles.rotateCollapsed} text-primary-500`}
              w={24}
              h={24}
            />
          )}
          <div className={`${styles.title}`}>{title}</div>
          <div className={styles.hoverArea}>
            <div style={{ opacity: 0 }}>
              {hoverRender}
            </div>
          </div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            transition: "all .3s ease-in-out",
            color: "#374151",
            display: "grid",
            overflow: "hidden",
            gridTemplateRows: open ? "1fr" : "0fr",
            opacity: open ? 1 : 0,
          }}
        >
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
