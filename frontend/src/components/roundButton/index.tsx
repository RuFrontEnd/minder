"use client";
import * as RoundButtonTypes from "@/types/components/roundButton";

const RoundButton = (props: RoundButtonTypes.Props) => {
  const size = {
    default: 24,
    differece: 6,
  };

  const coreClassName = `inline-flex items-center justify-center flex-shrink-0 cursor-pointer rounded-full shadow-md`;

  return (
    <>
      {props.outerRing ? (
        <button
          style={{
            width: props.size ? props.size : size.default,
            height: props.size ? props.size : size.default,
          }}
          className={`inline-flex items-center justify-center bg-white-500 flex-shrink-0 cursor-pointer rounded-full shadow-md ${props.className}`}
          onClick={props.onClick}
          onKeyDown={props.onKeyDown}
        >
          <div
            style={{
              width: props.size
                ? props.size - size.differece
                : size.default - size.differece,
              height: props.size
                ? props.size - size.differece
                : size.default - size.differece,
            }}
            className={`${coreClassName} bg-primary-500`}
          >
            {props.content}
          </div>
        </button>
      ) : (
        <button
          style={{
            width: props.size ? props.size : size.default,
            height: props.size ? props.size : size.default,
          }}
          className={`${coreClassName} bg-primary-500 ${props.className}`}
          onClick={props.onClick}
        >
          {props.content}
        </button>
      )}
    </>
  );
};

export default RoundButton;
