"use client";
import React from "react";
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
          <CreateShapeButtons
            isOverAllSidePanelOpen={props.isOverAllSidePanelOpen}
            actionRecords={props.actionRecords}
            shapes={props.shapes}
            offset={props.offset}
            scale={props.scale}
            reload={props.reload}
            onCreateStep={props.onCreateStep}
            initShapeSize={props.initShapeSize}
            isConnectMode={props.isConnectMode}
            onChangeConnectMode={props.onChangeConnectMode}
            onFitView={props.onFitView}
            onZoomIn={props.onZoomIn}
            onZoomOut={props.onZoomOut}
          />
        </div>
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
