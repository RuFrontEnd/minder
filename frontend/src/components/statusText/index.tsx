import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import Icon from '@/components/icon'
import * as StatusTextTypes from "@/types/components/statusText";
import * as CommonTypes from "@/types/common";
import * as IconTypes from "@/types/components/icon";
import styles from "./StatusText.module.css";


const StatusText = (props: StatusTextTypes.Props) => {
  const textColor = (() => {
    const defaultColor = "#111827"

    if (props.status === CommonTypes.DataStatus.default) {
      return defaultColor;
    }

    if (props.status === CommonTypes.DataStatus.pass) {
      return tailwindColors.success['500'];
    }

    if (props.status === CommonTypes.DataStatus.warning) {
      return tailwindColors.warning['500'];
    }

    if (props.status === CommonTypes.DataStatus.error) {
      return tailwindColors.error['500'];
    }

    return defaultColor;
  })()

  return (
    <div id={props.id} className={styles.root}>
      <p className={styles.text} style={{ color: textColor }}>{props.text}</p>
      {props.status === CommonTypes.DataStatus.error && <Icon className={styles.icon} type={IconTypes.Type.xCircle} stroke={tailwindColors.error['500']} w={14} h={14} />}
      {props.status === CommonTypes.DataStatus.warning && <Icon className={styles.icon} type={IconTypes.Type.exclaimationMarkTriangle} stroke={tailwindColors.warning['500']} w={14} h={14} />}
      {props.status === CommonTypes.DataStatus.pass && <Icon className={styles.icon} type={IconTypes.Type.tickCircle} stroke={tailwindColors.success['500']} w={14} h={14} />}
    </div>
  );
};

export default StatusText;
