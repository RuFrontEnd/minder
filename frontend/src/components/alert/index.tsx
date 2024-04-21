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
  })(),
    fillColor = (() => {
      if (props.type === AlertTypes.Type.succeess) {
        return tailwindColors.success['500'];
      } else if (props.type === AlertTypes.Type.warning) {
        return tailwindColors.warning['500'];
      } else {
        return tailwindColors.error['500'];
      }
    })();

  return (
    <>
      {props.text && (
        <>
          <div className={`inline-flex items-center text-sm ${props.className ? props.className : ""}`} role="alert">
            {props.type === AlertTypes.Type.succeess &&
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={fillColor} viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd" />
              </svg>
            }
            {props.type === AlertTypes.Type.warning &&
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z" clip-rule="evenodd" />
              </svg>
            }
            {props.type === AlertTypes.Type.error &&
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={fillColor} viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd" />
              </svg>
            }

            <span className={`font-medium ms-1 ${textColor}`}>{props.text}</span>
          </div>
        </>
      )
      }
    </>
  );
};

export default Alert;
