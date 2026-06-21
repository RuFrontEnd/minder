import * as AlertTypes from "@/types/components/alert";
import { tailwindColors } from "@/variables/colors";
import styles from "./Alert.module.css";

const Alert = (props: AlertTypes.Props) => {
  const textColor = (() => {
    if (props.type === AlertTypes.Type.succeess) {
      return tailwindColors.success['500'];
    } else if (props.type === AlertTypes.Type.warning) {
      return tailwindColors.warning['500'];
    } else {
      return tailwindColors.error['500'];
    }
  })(),
    fillColor = textColor;

  return (
    <>
      {props.text && (
        <div className={`${styles.root} ${props.className ? props.className : ""}`} role="alert">
          {props.type === AlertTypes.Type.succeess && (
            <svg className={styles.icon} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={fillColor} viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
            </svg>
          )}
          {props.type === AlertTypes.Type.warning && (
            <svg className={styles.icon} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z" clipRule="evenodd" />
            </svg>
          )}
          {props.type === AlertTypes.Type.error && (
            <svg className={styles.icon} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={fillColor} viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clipRule="evenodd" />
            </svg>
          )}

          <span className={styles.text} style={{ color: textColor }}>{props.text}</span>
        </div>
      )}
    </>
  );
};

export default Alert;
