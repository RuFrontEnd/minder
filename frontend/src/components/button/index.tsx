import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as ButtonTypes from "@/types/components/button";

const Button = (props: ButtonTypes.Props) => {
  const statusStyle = (() => {
    if (props.disabled) {
      return "bg-grey-5 cursor-default";
    }
    if(props.danger){
      return "bg-error-500"
    }
    return "bg-primary-500";
  })();

  return (
    <button
      id={props.id}
      className={`${statusStyle} flex justify-center items-center text-white-500 border-0 py-2 px-6 focus:outline-none rounded text-md ease-in-out duration-300 ${
        props.className && props.className
      }`}
      onClick={props.loading ? undefined : props.onClick}
    >
      {props.text}
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
