"use client";
import * as IconTypes from "@/types/components/icon";
import { tailwindColors } from "@/variables/colors";

export default function Icon(props: IconTypes.Props) {
  const defaultVal = {
    w: 12,
    h: 12,
    fill: tailwindColors.black["1"],
    stroke: tailwindColors.black["1"],
  };
  return (
    <>
      {(!props.type || props.type === IconTypes.Type.x) && (
        <svg
          className={props.className}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
        >
          <path
            style={{
              fill: props.fill || defaultVal.fill,
              stroke: props.stroke || defaultVal.stroke,
            }}
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      )}
      {props.type === IconTypes.Type.pencilSquare && (
        <svg
          className={props.className}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
        >
          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
          <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
        </svg>
      )}
    </>
  );
}
