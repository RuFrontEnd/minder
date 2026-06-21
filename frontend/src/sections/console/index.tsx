"use client";
import React, { useState } from "react";
import Zoom from "@/sections/zoom";
import SidePanel from "@/components/sidePanel";
import CreateShapeButtons from "@/sections/createShapeButtons";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import { tailwindColors } from "@/variables/colors";
import styles from "./Console.module.css";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as ConsoleTypes from "@/types/sections/id/console";
import * as CommonTypes from "@/types/common";
import Divider from "@/components/divider";
import ProjectModal from "@/components/modal/ProjectModal";

export default function Console(props: ConsoleTypes.Props) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleSelectProject = (project: any) => {
    console.log("selected project", project);
    // TODO: integrate selected project into app state
  };
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
            <Zoom zoom={props.zoom} scale={props.scale} />
            <SquareButton
              size={32}
              style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
              content={<Icon w={14} h={14} fill={tailwindColors.grey["1"]} />}
              onClick={() => setIsProjectModalOpen(true)}
            />
          </div>
        </div>
      </div>
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSelect={handleSelectProject} />
    </>
  );
}

// Render ProjectModal at root of this module so it's available when opened
function ProjectModalRenderer({ isOpen, setIsOpen, onSelect }: { isOpen: boolean; setIsOpen: (v: boolean) => void; onSelect?: (p: any) => void }) {
  return (
    <ProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSelect={onSelect} />
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
