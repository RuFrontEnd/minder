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
            }}
            x="12.5545645"
            y="12.5545635"
            transform="matrix(0.7071068 -0.7071068 0.7071068 0.7071068 -13.2548332 32)"
            width={"38.890873"}
            height={"38.890873"}
          />
        </svg>
      )}
      {props.type === IconTypes.Type.rotateCcw && (
        <svg
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
          }}
          className={props.className}
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
          enable-background="new 0 0 52 52"
        >
          <path
            d="M30.3,12.6c10.4,0,18.9,8.4,18.9,18.9s-8.5,18.9-18.9,18.9h-8.2c-0.8,0-1.3-0.6-1.3-1.4v-3.2
c0-0.8,0.6-1.5,1.4-1.5h8.1c7.1,0,12.8-5.7,12.8-12.8s-5.7-12.8-12.8-12.8H16.4c0,0-0.8,0-1.1,0.1c-0.8,0.4-0.6,1,0.1,1.7l4.9,4.9
c0.6,0.6,0.5,1.5-0.1,2.1L18,29.7c-0.6,0.6-1.3,0.6-1.9,0.1l-13-13c-0.5-0.5-0.5-1.3,0-1.8L16,2.1c0.6-0.6,1.6-0.6,2.1,0l2.1,2.1
c0.6,0.6,0.6,1.6,0,2.1l-4.9,4.9c-0.6,0.6-0.6,1.3,0.4,1.3c0.3,0,0.7,0,0.7,0L30.3,12.6z"
          />
        </svg>
      )}
      {props.type === IconTypes.Type.arrow && (
        <svg
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            stroke: props.stroke || defaultVal.stroke,
          }}
          className={props.className}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m8 10 4 4 4-4"
          />
        </svg>
      )}
      {props.type === IconTypes.Type.arrowSolid && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
          }}
          className={props.className}
          viewBox="0 0 24 24"
        >
          <path d="m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z" />
        </svg>
      )}
    </>
  );
}
