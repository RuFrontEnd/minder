"use client";
import React from "react";
import Zoom from "@/sections/zoom";
import SidePanel from "@/components/sidePanel";
import CreateShapeButtons from "@/sections/createShapeButtons";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import Divider from "@/components/divider";
import Procedure from "@/shapes/procedure";
import Process from "@/shapes/process";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/configs/colors";
import { v4 as uuidv4 } from "uuid";
import * as shapeConfigs from "@/configs/shape";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as ConsoleTypes from "@/types/sections/id/console";
import * as CommonTypes from "@/types/common";

export default function Console(props: ConsoleTypes.Props) {
  const onClickUndoButton = () => {
    props.undo();
  };

  const onClickMessage = (shapes: CommonTypes.Shape[], shapeId: string) => {
    const targetShape = shapes.find((shape: any) => shape.id === shapeId);
    if (!targetShape) return;
    props.positioning(shapes, targetShape.p);
    props.setIndivisual(targetShape);
    props.setIsIndivisualSidePanelOpen(true);
  };

  const onClickProceduralizeSquareButton = () => {
    if (!props.selection) return;
    const selectedShapeIds: { [shapeId: string]: boolean } = {};

    props.selection.shapes.forEach((selectedShape) => {
      selectedShapeIds[selectedShape.id] = true;
    });

    const procedureConnectionCurves: CommonTypes.ConnectionCurves = [];
    const newConnectionCurves: CommonTypes.ConnectionCurves = [];

    cloneDeep(props.connectionCurves).forEach((connectionCurve) => {
      if (
        connectionCurve.from.shape.id in selectedShapeIds &&
        connectionCurve.to.shape.id in selectedShapeIds
      ) {
        procedureConnectionCurves.push(connectionCurve);
      } else if (
        !(connectionCurve.from.shape.id in selectedShapeIds) &&
        !(connectionCurve.to.shape.id in selectedShapeIds)
      ) {
        newConnectionCurves.push(connectionCurve);
      }
    });

    const initPosition = {
      x:
        props.selection.shapes.reduce((prev, next) => prev + next.p.x, 0) /
        props.selection.shapes.length,
      y:
        props.selection.shapes.reduce((prev, next) => prev + next.p.y, 0) /
        props.selection.shapes.length,
    };

    const newShapes = cloneDeep(props.shapesObservable.getValue()).filter(
      (shape) => !(shape.id in selectedShapeIds)
    );

    newShapes.push(
      new Procedure(
        `procedure_${uuidv4()}`,
        shapeConfigs.initSize.prcd.w,
        shapeConfigs.initSize.prcd.h,
        initPosition,
        "Procedure",
        props.selection.shapes,
        procedureConnectionCurves,
        Process.getPath
      )
    );

    props.shapesObservable.setValue(newShapes);
    props.updateConnectionCurves(
      props.shapesObservable.getValue(),
      newConnectionCurves
    );
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
                  onClickMessage(
                    props.shapesObservable.getValue(),
                    consoleItem.shape.id
                  );
                }}
              >
                {consoleItem.message}
              </li>
            );
          })}
        </ul>
      </div>
      <CreateShapeButtons
        shapesObservable={props.shapesObservable}
        isOverAllSidePanelOpen={props.isOverAllSidePanelOpen}
        actionRecords={props.actionRecords}
        offset={props.offset}
        scale={props.scale}
        reload={props.reload}
      />
      <SquareButton
        className="absolute -top-4 -translate-y-full right-[176px] flex"
        role="proceduralize"
        size={32}
        shadow
        // content={
        //   <Icon
        //     type={IconTypes.Type.upload}
        //     w={16}
        //     h={16}
        //     fill={tailwindColors.grey["1"]}
        //   />
        // }
        onClick={onClickProceduralizeSquareButton}
      />
      <SquareButton
        role="undo"
        className="absolute -top-4 -translate-y-full right-[128px] flex"
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
      <Zoom
        shapesObservable={props.shapesObservable}
        zoom={props.zoom}
        scale={props.scale}
      />
    </SidePanel>
  );
}
