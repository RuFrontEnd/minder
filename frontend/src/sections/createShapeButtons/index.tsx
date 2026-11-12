"use client";
import React, { useState } from "react";
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
import { assignStepIdentifier } from "@/utils/stepIdentifier";
import { recordStepCreator } from "@/utils/stepCreator";
import styles from "./CreateShapeButtons.module.css";
import * as CommonTypes from "@/types/common";
import * as CreateShapeButtonsTypes from "@/types/sections/id/createShapeButtons";

const isBrowser = typeof window !== "undefined";
const stepCardWidth = 200;
const stepCardHeight = 96;
const stepGap = 24;

export default function CreateShapeButtons(
  props: CreateShapeButtonsTypes.Props
) {
  const [createStepError, setCreateStepError] = useState("");

  const getInitializedStep = (offset: CommonTypes.Vec, scale: number = 1) => {
    const centerPosition = {
      x: -offset.x + window.innerWidth / 2 / scale,
      y: -offset.y + window.innerHeight / 2 / scale,
    };
    const spacingX = stepCardWidth + stepGap;
    const spacingY = stepCardHeight + stepGap;
    let position = centerPosition;
    let ring = 0;

    while (
      props.shapes.some(
        (shape) =>
          Math.abs(shape.p.x - position.x) < spacingX &&
          Math.abs(shape.p.y - position.y) < spacingY
      )
    ) {
      ring += 1;
      const candidates: CommonTypes.Vec[] = [];

      for (let y = -ring; y <= ring; y += 1) {
        candidates.push({ x: ring, y });
      }
      for (let x = ring - 1; x >= -ring; x -= 1) {
        candidates.push({ x, y: ring });
      }
      for (let y = ring - 1; y >= -ring; y -= 1) {
        candidates.push({ x: -ring, y });
      }
      for (let x = -ring + 1; x < ring; x += 1) {
        candidates.push({ x, y: -ring });
      }

      const availableCandidate = candidates.find(({ x, y }) => {
        const candidatePosition = {
          x: centerPosition.x + x * spacingX,
          y: centerPosition.y + y * spacingY,
        };
        return !props.shapes.some(
          (shape) =>
            Math.abs(shape.p.x - candidatePosition.x) < spacingX &&
            Math.abs(shape.p.y - candidatePosition.y) < spacingY
        );
      });

      if (availableCandidate) {
        position = {
          x: centerPosition.x + availableCandidate.x * spacingX,
          y: centerPosition.y + availableCandidate.y * spacingY,
        };
      }
    }

    return new Process(
      `step_${uuidv4()}`,
      props.initShapeSize.p.w,
      props.initShapeSize.p.h,
      position,
      "Untitled step"
    );
  };

  const onClickCreateStep = () => {
    if (!isBrowser) return;

    setCreateStepError("");
    const newStep = getInitializedStep(props.offset, props.scale);
    assignStepIdentifier(newStep, props.shapes);
    recordStepCreator(newStep.id);
    props.actionRecords.register(CommonTypes.Action.add);
    props.shapes.push(newStep);
    props.actionRecords.finish(CommonTypes.Action.add);
    props.reload();

    void props.onCreateStep(newStep).catch((error) => {
      console.error("Failed to create step:", error);
      setCreateStepError(
        "Step added to canvas, but could not be saved to the project."
      );
    });
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
          title={createStepError || "Create step"}
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
      {createStepError && (
        <span className={styles.errorMessage} role="alert">
          {createStepError}
        </span>
      )}
    </section>
  );
}
