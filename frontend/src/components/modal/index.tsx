import ReactModal from "react-modal";
import RoundButton from "@/components/roundButton";
import Icon from "@/components/icon";
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
          <RoundButton
            outerRing
            className={"absolute top-[0px] right-[0px]"}
            onClick={props.onClickX}
            content={<Icon stroke={tailwindColors.white["500"]} />}
          />
        )}

        {props.children}
      </div>
    </ReactModal>
  );
};

export default Modal;
