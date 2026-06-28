"use client";
import React from "react";
import Zoom from "@/sections/zoom";
import CreateShapeButtons from "@/sections/createShapeButtons";
import styles from "./Console.module.css";
import * as ConsoleTypes from "@/types/sections/id/console";

export default function Console(props: ConsoleTypes.Props) {
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
