import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";

const Button = (props: ButtonTypes.Props) => {
  const { id, className, text, onClick } = props;

  return (
    <button
      id={id}
      className={`${
        className && className
      } flex justify-center items-center text-white-500 bg-primary-500 hover:bg-primary-hover border-0 py-2 px-6 focus:outline-none rounded text-md ease-in-out duration-300`}
      onClick={onClick}
    >
      {text}
      {props.loading && (
        <ReactLoading
          className={"ml-2"}
          type={"spin"}
          color={tailwindColors.white["500"]}
          height={20}
          width={20}
        />
      )}
    </button>
  );
};

export default Button;
