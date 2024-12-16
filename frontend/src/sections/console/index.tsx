"use client";
import React, { useState, ChangeEvent } from "react";
import Zoom from "@/sections/zoom";
import DataBox from "@/blocks/indivisualSidePanel/dataBox";
import SidePanel from "@/components/sidePanel";
import CreateShapeButtons from "@/sections/createShapeButtons";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import * as handleUtils from "@/utils/handle";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/select";
import * as IconTypes from "@/types/components/icon";
import * as PageIdTypes from "@/types/app/pageId";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as ButtonTypes from "@/types/components/button";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";
import * as CommonTypes from "@/types/common";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Decision from "@/shapes/decision";
import Divider from "@/components/divider";

export default function Console(
  props: any
  // IndivisaulSidePanelTypes.Props
) {
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
    <SidePanel
      role={"console"}
      open={props.isConsoleOpen}
      flow={SidePanelTypes.Flow.column}
      switchButtonD={SidePanelTypes.SwitchButtonD.start}
      horizentalD={(() => {
        if (props.isOverAllSidePanelOpen && props.isIndivisualSidePanelOpen)
          return SidePanelTypes.HorizentalD.m;

        if (props.isOverAllSidePanelOpen) return SidePanelTypes.HorizentalD.r;

        if (props.isIndivisualSidePanelOpen)
          return SidePanelTypes.HorizentalD.l;

        return SidePanelTypes.HorizentalD.m;
      })()}
      verticalD={SidePanelTypes.VerticalD.b}
      w={(() => {
        if (props.isOverAllSidePanelOpen && props.isIndivisualSidePanelOpen)
          return "calc(100vw - 688px)";

        if (props.isOverAllSidePanelOpen || props.isIndivisualSidePanelOpen)
          return "calc(100vw - 344px)";

        return "calc(100vw)";
      })()}
      h={"284px"}
      onClickSwitch={() => {
        props.setIsConsoleOpen((isOpenConsole: any) => !isOpenConsole);
      }}
    >
      <div className="h-full p-4">
        <p className="px-2 text-lg font-semibold text-grey-1">Console</p>
        <Divider className="w-full" margin={{ y: 4 }} />
        <ul>
          {props.consoles.map((consoleItem: any) => {
            const status = (() => {
              switch (consoleItem.status) {
                case CommonTypes.DataStatus.error:
                  return "text-error-500";
              }
            })();
            return (
              <li
                className={`px-2 mb-1 ${
                  status || ""
                } cursor-pointer underline-offset-2 hover:underline`}
                onClick={() => {
                  onClickMessage(consoleItem.shape.id);
                }}
              >
                {consoleItem.message}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="absolute -top-4 -translate-y-full left-1/2 -translate-x-1/2">
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
      <div className="absolute -top-4 -translate-y-full right-0 flex">
        <SquareButton
          className="mr-4"
          size={32}
          shadow
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
    </SidePanel>
  );
}
