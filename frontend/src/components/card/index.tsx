import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as CardTypes from "@/types/components/card";

const Card = (props: CardTypes.Props) => {
  return (
    <div
      id={String(props.id)}
      className={`${props.className ? props.className : ""}`}
      onClick={() => {
        props.onClick && props.onClick(props.id);
      }}
    >
      <a className="block relative h-48 rounded overflow-hidden">
        <img
          alt="project"
          className={`object-cover object-center w-full h-full block ${
            props.selected && "border-info-500 border-2"
          }`}
          src="https://dummyimage.com/324x200"
        />
      </a>
      <div className="mt-1 ms-1">{props.text}</div>
    </div>
  );
};

export default Card;
