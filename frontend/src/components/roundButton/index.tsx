"use client";
import * as RoundButtonTypes from "@/types/components/roundButton";
import styles from "./RoundButton.module.css";

const RoundButton = (props: RoundButtonTypes.Props) => {
  const size = {
    default: 24,
    differece: props.differece || 6,
  };

  const buttonStyle = {
    width: props.size ? props.size : size.default,
    height: props.size ? props.size : size.default,
    backgroundColor: props.outerRing
      ? undefined
      : (props.color as any) || undefined,
  } as React.CSSProperties;

  const innerDivStyle = {
    width: props.size
      ? props.size - size.differece
      : size.default - size.differece,
    height: props.size
      ? props.size - size.differece
      : size.default - size.differece,
    backgroundColor: props.outerRing ? (props.color as any) : undefined,
  } as React.CSSProperties;

  const renderButton = () => (
    <button
      style={buttonStyle}
      className={`${styles.core} ${props.className ? props.className : ""}`}
      tabIndex={props.tabIndex ? props.tabIndex : -1}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
    >
      {props.outerRing ? (
        <div style={innerDivStyle} className={styles.inner}>
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
