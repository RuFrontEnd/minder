import ReactLoading from "react-loading";
import { tailwindColors } from "@/variables/colors";
import Icon from '@/components/icon'
import * as StatusTextTypes from "@/types/components/statusText";
import * as CommonTypes from "@/types/common";
import * as IconTypes from "@/types/components/icon";


const StatusText = (props: StatusTextTypes.Props) => {
  const textStatusStyle = (() => {
    const defaultStyle = "text-black-2"

    if (props.status === CommonTypes.DataStatus.default) {
      return defaultStyle;
    }

    if (props.status === CommonTypes.DataStatus.pass) {
      return "text-success-500";
    }

    if (props.status === CommonTypes.DataStatus.warning) {
      return "text-warning-500";
    }

    if (props.status === CommonTypes.DataStatus.error) {
      return "text-error-500";
    }

    return defaultStyle;
  })()

  return (
    <div id={props.id} className="flex items-center">
      <p className={`${textStatusStyle}`}>{props.text}</p>
      {props.status === CommonTypes.DataStatus.error && <Icon className="m-1" type={IconTypes.Type.xCircle} stroke={tailwindColors.error['500']} w={14} h={14} />}
      {props.status === CommonTypes.DataStatus.warning && <Icon className="m-1" type={IconTypes.Type.exclaimationMarkTriangle} stroke={tailwindColors.warning['500']} w={14} h={14} />}
      {props.status === CommonTypes.DataStatus.pass && <Icon className="m-1" type={IconTypes.Type.tickCircle} stroke={tailwindColors.success['500']} w={14} h={14} />}
    </div>
  );
};

export default StatusText;
