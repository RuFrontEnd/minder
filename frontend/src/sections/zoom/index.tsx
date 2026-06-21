"use client";
import SquareButton from "@/components/squareButton";
import Icon from "@/components/icon";
import { tailwindColors } from "@/variables/colors";
import styles from "./Zoom.module.css";
import * as IconTypes from "@/types/components/icon";
import * as SquareButtonTypes from "@/types/components/squareButton";
import * as ZoomTypes from "@/types/sections/id/zoom";

export default function Zoom(props: ZoomTypes.Props) {
  const onClickScalePlusIcon = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    props.zoom(-100, {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const onClickScaleMinusIcon = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    props.zoom(100, {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const onClickScaleNumber = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;

    props.zoom(-((1 / props.scale - 1) * 500), {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  return (
    <div role="zoom">
      <div className={styles.box} style={{ ["--border-color" as any]: tailwindColors.grey["5"], ["--bg" as any]: tailwindColors.white["500"] } as React.CSSProperties}>
        <div className={styles.row}>
          <SquareButton
            part={SquareButtonTypes.Part.left}
            size={32}
            content={
              <Icon
                type={IconTypes.Type.minus}
                w={14}
                h={14}
                fill={tailwindColors.grey["1"]}
              />
            }
            onClick={onClickScaleMinusIcon}
          />
          <SquareButton
            part={SquareButtonTypes.Part.middle}
            w={48}
            h={32}
            content={<>{Math.ceil(props.scale * 100)}%</>}
            onClick={onClickScaleNumber}
          />
          <SquareButton
            part={SquareButtonTypes.Part.right}
            size={32}
            content={
              <Icon
                type={IconTypes.Type.plus}
                w={14}
                h={14}
                fill={tailwindColors.grey["1"]}
              />
            }
            onClick={onClickScalePlusIcon}
          />
        </div>
      </div>
    </div>
  );
}
