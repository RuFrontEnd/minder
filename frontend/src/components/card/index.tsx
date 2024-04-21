import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as CardTypes from "@/types/components/card";

const Card = (props: CardTypes.Props) => {

  return (
    <div id={props.id} className={`p-4 ${props.className ? props.className : ""}`}>
      <a className="block relative h-48 rounded overflow-hidden">
        <img
          alt="project"
          className="object-cover object-center w-full h-full block"
          src="https://dummyimage.com/324x200"
        />
      </a>
      <div className="mt-1 ms-1">
        {props.text}
      </div>
    </div>
  );
};

export default Card;
