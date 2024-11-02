import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import * as SimpleButtonTypes from "@/types/components/simpleButton";

const SimpleButton = (props: SimpleButtonTypes.Props) => {
  const size = (() => {
    if (props.size === SimpleButtonTypes.Size.sm) {
      return "text-sm";
    }

    if (props.size === SimpleButtonTypes.Size.md) {
      return "text-md";
    }

    if (props.size === SimpleButtonTypes.Size.lg) {
      return "text-lg";
    }

    return "text-md";
  })();

  return (
    <button
      className={`flex items-center text-info-500 ${size} ${props.className}`}
      onClick={props.onClick}
    >
      {props.loading && (
        <ReactLoading
          className={"mr-1"}
          type={"spin"}
          color={tailwindColors.info["500"]}
          height={20}
          width={20}
        />
      )}
      {props.text}
    </button>
  );
};

export default SimpleButton;
