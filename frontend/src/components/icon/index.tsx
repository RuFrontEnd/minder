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
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
          className={props.className}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
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
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
          className={props.className}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
          <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
        </svg>
      )}
      {props.type === IconTypes.Type.ellipse && (
        <svg
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 256 256"
          enable-background="new 0 0 256 256"
          xmlSpace="preserve"
        >
          <g>
            <g>
              <path
                style={{
                  fill: props.fill || defaultVal.fill,
                  stroke: props.stroke || defaultVal.stroke,
                }}
                d="M246,128c0,49.2-39.9,89-89,89H99c-49.2,0-89-39.9-89-89l0,0c0-49.2,39.9-89,89-89H157C206.1,39,246,78.8,246,128L246,128z"
              />
            </g>
          </g>
        </svg>
      )}
      {props.type === IconTypes.Type.square && (
        <svg
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          x="0px"
          y="0px"
          viewBox="0 0 100 100"
          xmlSpace="preserve"
        >
          <path
            style={{
              fill: props.fill || defaultVal.fill,
              stroke: props.stroke || defaultVal.stroke,
            }}
            className="st0"
            d="M93.44,78.48H6.56V21.52h86.88V78.48z"
          />
        </svg>
      )}
      {props.type === IconTypes.Type.parallelogram && (
        <svg
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
          xmlns="http://www.w3.org/2000/svg"
          data-name="Layer 21"
          viewBox="0 0 32 32"
          x="0px"
          y="0px"
        >
          <path
            style={{
              fill: props.fill || defaultVal.fill,
              stroke: props.stroke || defaultVal.stroke,
            }}
            d="M30.387,5.683A.5.5,0,0,0,30,5.5H6a.5.5,0,0,0-.49.4l-4,20a.5.5,0,0,0,.49.6H26a.5.5,0,0,0,.49-.4l4-20A.5.5,0,0,0,30.387,5.683Z"
          />
        </svg>
      )}
      {props.type === IconTypes.Type.dimond && (
        <svg
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
            stroke: props.stroke || defaultVal.stroke,
          }}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          x="0px"
          y="0px"
          viewBox="0 0 64 64"
          xmlSpace="preserve"
        >
          <rect
            style={{
              fill: props.fill || defaultVal.fill,
              stroke: props.stroke || defaultVal.stroke,
            }}
            x="12.5545645"
            y="12.5545635"
            transform="matrix(0.7071068 -0.7071068 0.7071068 0.7071068 -13.2548332 32)"
            width={"38.890873"}
            height={"38.890873"}
          />
        </svg>
      )}
    </>
  );
}
