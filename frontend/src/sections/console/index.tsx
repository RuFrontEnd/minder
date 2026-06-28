"use client";
import React from "react";
import Zoom from "@/sections/zoom";
import CreateShapeButtons from "@/sections/createShapeButtons";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import { tailwindColors } from "@/variables/colors";
import styles from "./Console.module.css";
import * as IconTypes from "@/types/components/icon";
import * as ConsoleTypes from "@/types/sections/id/console";

export default function Console(props: ConsoleTypes.Props) {
  const onClickUndoButton = () => {
    props.undo();
  };

  const onClickMessage = (shapeId: string) => {
    const targetShape = props.shapes.find((shape: any) => shape.id === shapeId);
    if (!targetShape) return;
    props.positioning(targetShape.p);
    props.setIndivisual(targetShape);
    props.setIsIndivisualSidePanelOpen(true);
  };

  return (
    <>
      <div className={styles.root}>
        <div className={styles.toolbar}>
          <div className={styles.leftFloating}>
            <div></div>
            <div></div>
          </div>

          <div>
            <CreateShapeButtons
              isOverAllSidePanelOpen={props.isOverAllSidePanelOpen}
              actionRecords={props.actionRecords}
              shapes={props.shapes}
              offset={props.offset}
              scale={props.scale}
              reload={props.reload}
              initShapeSize={props.initShapeSize}
            />
          </div>
          <div className={styles.rightFloating}>
            <SquareButton
              size={32}
              style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
              content={
                <Icon
                  type={IconTypes.Type.rotateCcw}
                  w={14}
                  h={14}
                  fill={tailwindColors.grey["1"]}
                />
              }
              onClick={onClickUndoButton}
            />
          </div>
        </div>
      </div>

      <div className={styles.zoomDock}>
        <Zoom zoom={props.zoom} scale={props.scale} />
      </div>
    </>
  );
}

// Project modal rendered outside toolbar
export function ConsoleWithProjectModal(props: ConsoleTypes.Props) {
  return (
    <>
      <Console {...props} />
    </>
  );
}
