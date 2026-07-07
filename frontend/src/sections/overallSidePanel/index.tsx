"use client";
import React, { useState } from "react";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import SidePanel from "@/components/sidePanel";
import Accordion from "@/components/accordion";
import Input from "@/components/input";
import Frame from "@/components/frame";
import PencilSquareIcon from "@/assets/svg/pencil-square.svg";
import Icon from "@/components/icon";
import { motion } from "framer-motion";
// lodash clone not required after removing data management
import { ChangeEventHandler, MouseEventHandler } from "react";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";
import * as CommonTypes from "@/types/common";
import * as OverallSidePanelTypes from "@/types/sections/id/overallSidePanel";

import * as IconTypes from "@/types/components/icon";
// PageIdTypes no longer required (data tab removed)
import * as SidePanelTypes from "@/types/components/sidePanel";

export default function OverallSidePanel(props: OverallSidePanelTypes.Props) {
  const [isRenameFrameOpen, setIsRenameFrameOpen] = useState(false);
  // Overall side panel only shows Step tab (Data tab removed)

  const onClickOverallSidePanelSwitch = () => {
    props.setIsOverAllSidePanelOpen((open) => !open);
  };

  const onClickPositioningButton = (shapeP: CommonTypes.Vec) => {
    props.positioning(shapeP);
  };

  const onClickStepRow = (shapeId: string, shapeP: CommonTypes.Vec) => {
    onClickPositioningButton(shapeP);
    props.onSelectStep?.(shapeId);
  };

  const onClickProjectName = () => {
    setIsRenameFrameOpen((isRenameFrameOpen) => !isRenameFrameOpen);
  };

  const onChangeProjectName: ChangeEventHandler<HTMLInputElement> = (e) => {
    props.setProjectName((projectName) => ({
      ...projectName,
      inputVal: e.target.value,
    }));
  };

  const onClickSaveProjectNameButton: MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    props.setProjectName({
      val: props.projectName.inputVal,
      inputVal: props.projectName.inputVal,
    });

    setIsRenameFrameOpen(false);
  };

  // tab switching removed — panel always shows Step list

  return (
    <SidePanel
      className={styles.root}
      title="Steps"
      open={props.isOverAllSidePanelOpen}
      placement="start"
      onClickSwitch={onClickOverallSidePanelSwitch}
      onCancel={() => {
        props.setIsOverAllSidePanelOpen(false);
      }}
      onInteractOutside={() => {
        props.setIsOverAllSidePanelOpen(false);
      }}
    >
      <ul style={{ height: "calc(100% - 52px)" }} className={styles.list}>
        {props.steps.map((step) => {
          const icon = (() => {
            let _type = undefined;
            let _color = undefined;
            if (step instanceof Terminal) {
              _type = IconTypes.Type.ellipse;
              _color = tailwindColors.shape.terminal;
            }
            if (step instanceof Process) {
              _type = IconTypes.Type.square;
              _color = tailwindColors.shape.process;
            }
            if (step instanceof Data) {
              _type = IconTypes.Type.parallelogram;
              _color = tailwindColors.shape.data;
            }
            if (step instanceof Desicion) {
              _type = IconTypes.Type.dimond;
              _color = tailwindColors.shape.decision;
            }

            return {
              type: _type,
              color: _color,
            };
          })();

          return (
            <li
              key={step.id}
              onClick={() => {
                onClickStepRow(step.id, step.p);
              }}
            >
              <div
                className={`${styles.stepRow} ${
                  props.selectedShapeId === step.id ? styles.dimmedRow : ""
                }`}
              >
                <div className={styles.iconBox}>
                  <Icon type={icon.type} w={20} h={20} fill={icon.color} />
                </div>
                <div className={styles.titleText}>
                  <p>{step.title}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </SidePanel>
  );
}
