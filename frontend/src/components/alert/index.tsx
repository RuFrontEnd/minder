import * as AlertTypes from "@/types/components/alert";
import { tailwindColors } from "@/variables/colors";

const Alert = (props: AlertTypes.Props) => {
  const textColor = (() => {
    if (props.type === AlertTypes.Type.succeess) {
      return "text-success-500";
    } else if (props.type === AlertTypes.Type.warning) {
      return "text-warning-500";
    } else {
      return "text-error-500";
    }
  })();

  return (
    <>
      {props.text && (
        <>
          <div className={`inline-flex items-center text-sm ${props.className ? props.className : ""}`} role="alert">
            <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={tailwindColors.success['500']} viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd" />
            </svg>
            <span className={`font-medium ms-1 ${textColor}`}>{props.text}</span>
          </div>
        </>
      )
      }
    </>
  );
};

export default Alert;
