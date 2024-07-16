"use client";
import * as RoundButtonTypes from "@/types/components/roundButton";

const RoundButton = (props: RoundButtonTypes.Props) => {
  const defaultSize = 24;

  return (
    <div
      style={{
        width: props.size ? props.size : defaultSize,
        height: props.size ? props.size : defaultSize,
      }}
      className={`inline-flex items-center justify-center bg-white-500 flex-shrink-0 cursor-pointer rounded-full shadow-md ${props.className}`}
      onClick={props.onClick}
    >
      <div
        style={{
          width: props.size ? props.size - 6 : defaultSize - 6,
          height: props.size ? props.size - 6 : defaultSize - 6,
        }}
        className={`inline-flex items-center justify-center bg-primary-500 flex-shrink-0 cursor-pointer rounded-full`}
      >
        {props.content}
      </div>
    </div>
  );
};

export default RoundButton;
