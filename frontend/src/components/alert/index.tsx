import * as AlertTypes from "@/types/components/alert";

const Alert = (props: AlertTypes.Props) => {
  const color = (() => {
    if (props.type === AlertTypes.Type.succeess) {
      return "text-success-500 border-success-500 bg-success-500 bg-opacity-25";
    } else if (props.type === AlertTypes.Type.warning) {
      return "text-warning-500 border-warning-500 bg-warning-500 bg-opacity-25";
    } else {
      return "text-error-500 border-error-500 bg-error-500 bg-opacity-25";
    }
  })();

  return (
    <>
      {props.text && (
        <>
          <div className={`p-4 mb-4 text-sm rounded-md border ${color}`} role="alert">
            <span className="font-medium">{props.text}</span>
          </div>
        </>
      )}
    </>
  );
};

export default Alert;
