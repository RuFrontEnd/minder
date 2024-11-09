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
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path
            style={{
              fill: props.fill || defaultVal.fill,
              stroke: props.disabled
                ? tailwindColors.disabled["500"]
                : props.stroke || defaultVal.stroke,
            }}
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      )}
      {props.type === IconTypes.Type.xCircle && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            stroke: props.disabled
              ? tailwindColors.disabled["500"]
              : props.stroke || defaultVal.stroke,
          }}
          className={props.className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      )}
      {props.type === IconTypes.Type.exclaimationMarkTriangle && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            stroke: props.disabled
              ? tailwindColors.disabled["500"]
              : props.stroke || defaultVal.stroke,
          }}
          className={props.className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )}
      {props.type === IconTypes.Type.tick && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            stroke: props.disabled
              ? tailwindColors.disabled["500"]
              : props.stroke || defaultVal.stroke,
          }}
          className={props.className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {props.type === IconTypes.Type.tickCircle && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            stroke: props.disabled
              ? tailwindColors.disabled["500"]
              : props.stroke || defaultVal.stroke,
            cursor: props.disabled ? "default" : "",
          }}
          className={`${props.className}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )}
      {props.type === IconTypes.Type.pencilSquare && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            stroke: props.disabled
              ? tailwindColors.disabled["500"]
              : props.stroke || defaultVal.stroke,
            cursor: props.disabled ? "default" : "",
          }}
          className={`${props.className}`}
          onClick={props.disabled ? undefined : props.onClick}
          viewBox="0 0 24 24"
        >
          <path d="m16 2.012 3 3L16.713 7.3l-3-3zM4 14v3h3l8.299-8.287-3-3zm0 6h16v2H4z" />
        </svg>
      )}
      {props.type === IconTypes.Type.ellipse && (
        <svg
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
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
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
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
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
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
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
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
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
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
          role={props.role}
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
          onClick={props.disabled ? undefined : props.onClick}
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
          role={props.role}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
          }}
          className={props.className}
          viewBox="0 0 24 24"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path d="m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z" />
        </svg>
      )}
      {props.type === IconTypes.Type.plus && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
          }}
          className={props.className}
          viewBox="0 0 448 512"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
        </svg>
      )}
      {props.type === IconTypes.Type.minus && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
          }}
          className={props.className}
          viewBox="0 0 448 512"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
        </svg>
      )}
      {props.type === IconTypes.Type.bars && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role={props.role}
          style={{
            width: props.w || defaultVal.w,
            height: props.h || defaultVal.h,
            fill: props.fill || defaultVal.fill,
          }}
          className={props.className}
          viewBox="0 0 448 512"
          onClick={props.disabled ? undefined : props.onClick}
        >
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
        </svg>
      )}
    </>
  );
}
