"use client";
import React from "react";
import Zoom from "@/sections/zoom";
import SidePanel from "@/components/sidePanel";
import CreateShapeButtons from "@/sections/createShapeButtons";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as ConsoleTypes from "@/types/sections/id/console";
import * as CommonTypes from "@/types/common";
import Divider from "@/components/divider";

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
      <div className="fixed bottom-4 inset-x-0 flex justify-center items-center">
        <div className="relative inline-flex items-center">
          <div className="absolute right-full mr-2 flex gap-2 items-center">
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

          <div className="absolute left-full ml-2 flex gap-2 items-center">
            <SquareButton
              className="border border-grey-5"
              size={32}
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
          </div>
        </div>
      </div>
    </>
  );
}
