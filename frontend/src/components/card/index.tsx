import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as CardTypes from "@/types/components/card";

const Card = (props: CardTypes.Props) => {
  const { id, className } = props;

  return (
    <div className="lg:w-1/4 md:w-1/2 p-4 w-full">
      <a className="block relative h-48 rounded overflow-hidden">
        <img
          alt="ecommerce"
          className="object-cover object-center w-full h-full block"
          src="https://dummyimage.com/420x260"
        />
      </a>
      <div className="mt-1 ms-1">
        <h2 className="text-info-500 title-font text-lg font-medium">
          New Project
        </h2>
      </div>
    </div>
  );
};

export default Card;
