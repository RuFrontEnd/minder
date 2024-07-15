import ReactModal from "react-modal";
import CircleButton from "@/components/circularButton";
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
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
              >
                <path
                  stroke={`${tailwindColors.white["500"]}`}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="M6 18 17.94 6M18 18 6.06 6"
                />
              </svg>
            }
          />
        )}

        {props.children}
      </div>
    </ReactModal>
  );
};

export default Modal;
