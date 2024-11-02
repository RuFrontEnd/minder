"use client";
import * as RoundButtonTypes from "@/types/components/roundButton";

const RoundButton = (props: RoundButtonTypes.Props) => {
  const size = {
    default: 24,
    differece: props.differece || 6,
  };

  const coreClassName = `inline-flex items-center justify-center flex-shrink-0 cursor-pointer rounded-full shadow-md`;

  const buttonStyle = {
    width: props.size ? props.size : size.default,
    height: props.size ? props.size : size.default,
  };

  const innerDivStyle = {
    width: props.size
      ? props.size - size.differece
      : size.default - size.differece,
    height: props.size
      ? props.size - size.differece
      : size.default - size.differece,
  };

  const renderButton = () => (
    <button
      style={buttonStyle}
      className={`${coreClassName} ${
        props.outerRing ? "bg-white-500" : "bg-primary-500"
      } ${props.className}`}
      tabIndex={props.tabIndex ? props.tabIndex : -1}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
    >
      {props.outerRing ? (
        <div
          style={innerDivStyle}
          className={`${coreClassName} bg-primary-500`}
        >
          {props.content}
        </div>
      ) : (
        props.content
      )}
    </button>
  );

  return <>{renderButton()}</>;
};

export default RoundButton;
