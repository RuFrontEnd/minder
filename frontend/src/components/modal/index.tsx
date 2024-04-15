import ReactModal from "react-modal";
import * as ModalTypes from "@/types/components/modal";

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
          width: props.width || "auto",
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
      {props.children}
    </ReactModal>
  );
};

export default Modal;
