import ReactModal from "react-modal";
import CircleButton from "@/components/circularButton";
import XIcon from "@/assets/svg/x.svg";
import * as ModalTypes from "@/types/components/modal";
import { tailwindColors } from "@/variables/colors";

ReactModal.setAppElement("body");

const Modal = (props: ModalTypes.Props) => {
  return (
    <ReactModal
      isOpen={props.isOpen}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: props.zIndex || "1000",
        },
        content: {
          width: (props.width && props.width) || "auto",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          padding: 0,
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 0, 0, 0)",
          border: "none",
        },
      }}
      contentLabel="Example Modal"
    >
      <div className="relative p-6">
        {props.onClickX && (
          <CircleButton
            className={"absolute top-[0px] right-[0px]"}
            onClick={props.onClickX}
            content={
              <XIcon
                className={`w-3 h-3 [&>*]:stroke-cyan-700}`}
                fill={tailwindColors.white["500"]}
                storke={tailwindColors.white["500"]}
              />
            }
          />
        )}

        {props.children}
      </div>
    </ReactModal>
  );
};

export default Modal;
