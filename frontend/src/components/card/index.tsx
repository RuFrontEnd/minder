import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as CardTypes from "@/types/components/card";
import styles from "./Card.module.css";

const Card = (props: CardTypes.Props) => {
  return (
    <div
      id={String(props.id)}
      className={`${props.className ? props.className : ""}`}
      onClick={() => {
        props.onClick && props.onClick(props.id);
      }}
    >
      <a className={styles.imageWrapper}>
        <img
          alt="project"
          className={`${styles.image} ${props.selected ? styles.selected : ""}`}
          src={props.src}
        />
      </a>
      <div className={styles.text}>{props.text}</div>
    </div>
  );
};

export default Card;
