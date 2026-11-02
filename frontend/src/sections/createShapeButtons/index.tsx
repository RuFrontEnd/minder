"use client";
import React from "react";
import Process from "@/shapes/process";
import {
  MousePointer2,
  Search,
  Square,
  Waypoints,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import styles from "./CreateShapeButtons.module.css";
import * as CommonTypes from "@/types/common";
import * as CreateShapeButtonsTypes from "@/types/sections/id/createShapeButtons";

const isBrowser = typeof window !== "undefined";

export default function CreateShapeButtons(
  props: CreateShapeButtonsTypes.Props
) {
  const getInitializedStep = (offset: CommonTypes.Vec, scale: number = 1) => {
    const initPosition = {
      x: -offset.x + window.innerWidth / 2 / scale,
      y: -offset.y + window.innerHeight / 2 / scale,
    };
    return new Process(
      `step_${uuidv4()}`,
      props.initShapeSize.p.w,
      props.initShapeSize.p.h,
      initPosition,
      "Untitled step"
    );
  };

  const onClickCreateStep = () => {
    if (!isBrowser) return;
    props.actionRecords.register(CommonTypes.Action.add);
    props.shapes.push(getInitializedStep(props.offset, props.scale));
    props.actionRecords.finish(CommonTypes.Action.add);
    props.reload();
  };

  const onClickTool = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  return (
    <section className={styles.toolbar} aria-label="Canvas tools">
      <div className={styles.container}>
        <button
          type="button"
          className={`${styles.toolButton} ${
            !props.isConnectMode ? styles.toolButtonActive : ""
          }`}
          aria-label="Select tool"
          aria-pressed={!props.isConnectMode}
          onClick={(event) =>
            onClickTool(event, () => props.onChangeConnectMode(false))
          }
        >
          <MousePointer2 size={17} />
        </button>
        <button
          type="button"
          className={styles.toolButton}
          aria-label="Create step"
          title="Create step"
          onClick={(event) =>
            onClickTool(event, onClickCreateStep)
          }
        >
          <Square size={17} />
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${
            props.isConnectMode ? styles.toolButtonActive : ""
          }`}
          aria-label="Connect tool"
          aria-pressed={props.isConnectMode}
          onClick={(event) =>
            onClickTool(event, () =>
              props.onChangeConnectMode(!props.isConnectMode)
            )
          }
        >
          <Waypoints size={17} />
        </button>
        <button
          type="button"
          className={styles.toolButton}
          aria-label="Zoom in"
          onClick={(event) => onClickTool(event, props.onZoomIn)}
        >
          <ZoomIn size={17} />
        </button>
        <button
          type="button"
          className={styles.toolButton}
          aria-label="Zoom out"
          onClick={(event) => onClickTool(event, props.onZoomOut)}
        >
          <ZoomOut size={17} />
        </button>
        <button
          type="button"
          className={styles.toolButton}
          aria-label="Fit canvas to view"
          onClick={(event) => onClickTool(event, props.onFitView)}
        >
          <Search size={17} />
        </button>
      </div>
    </section>
  );
}
