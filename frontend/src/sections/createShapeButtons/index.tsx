"use client";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import SquareButton from "@/components/squareButton";
import Icon from "@/components/icon";
import { MouseEvent } from "react";
import { tailwindColors } from "@/configs/colors";
import { v4 as uuidv4 } from "uuid";
import * as shapeConfigs from "@/configs/shape";
import * as IconTypes from "@/types/components/icon";
import * as CommonTypes from "@/types/common";
import * as CreateShapeButtonsTypes from "@/types/sections/id/createShapeButtons";

const isBrowser = typeof window !== "undefined";

export default function CreateShapeButtons(
  props: CreateShapeButtonsTypes.Props
) {
  const createShapeButtons: {
    type: CreateShapeButtonsTypes.CreateShapeType;
    icon: JSX.Element;
  }[] = [
    {
      shape: CreateShapeButtonsTypes.CreateShapeType["terminator"],
      icon: IconTypes.Type.ellipse,
      size: 24,
      color: tailwindColors.shape.terminal,
    },
    {
      shape: CreateShapeButtonsTypes.CreateShapeType["process"],
      icon: IconTypes.Type.square,
      size: 24,
      color: tailwindColors.shape.process,
    },
    {
      shape: CreateShapeButtonsTypes.CreateShapeType["data"],
      icon: IconTypes.Type.parallelogram,
      size: 24,
      color: tailwindColors.shape.data,
    },
    {
      shape: CreateShapeButtonsTypes.CreateShapeType["decision"],
      icon: IconTypes.Type.dimond,
      size: 24,
      color: tailwindColors.shape.decision,
    },
  ].map((type) => ({
    type: type.shape,
    icon: (
      <Icon type={type.icon} w={type.size} h={type.size} fill={type.color} />
    ),
  }));

  const getInitializedShape = (
    type: CreateShapeButtonsTypes.CreateShapeType,
    offset: CommonTypes.Vec,
    scale: number = 1
  ) => {
    const initPosition = {
      x: -offset.x + window.innerWidth / 2 / scale,
      y: -offset.y + window.innerHeight / 2 / scale,
    };
    switch (type) {
      case CreateShapeButtonsTypes.CreateShapeType["terminator"]:
        return new Terminal(
          `${type}_${uuidv4()}`,
          shapeConfigs.initSize.t.w,
          shapeConfigs.initSize.t.h,
          initPosition,
          type
        );
      case CreateShapeButtonsTypes.CreateShapeType["process"]:
        return new Process(
          `${type}_${uuidv4()}`,
          shapeConfigs.initSize.p.w,
          shapeConfigs.initSize.p.h,
          initPosition,
          type
        );

      case CreateShapeButtonsTypes.CreateShapeType["data"]:
        return new Data(
          `${type}_${uuidv4()}`,
          shapeConfigs.initSize.d.w,
          shapeConfigs.initSize.d.h,
          initPosition,
          type
        );

      case CreateShapeButtonsTypes.CreateShapeType["decision"]:
        return new Desicion(
          `${type}_${uuidv4()}`,
          shapeConfigs.initSize.dec.w,
          shapeConfigs.initSize.dec.h,
          initPosition,
          type
        );
    }
  };

  const onClickCreateShapeButton = (
    e: MouseEvent<HTMLButtonElement>,
    type: CreateShapeButtonsTypes.CreateShapeType
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isBrowser) return;
    props.actionRecords.register(CommonTypes.Action.add);

    props.shapes.push(getInitializedShape(type, props.offset, props.scale));

    props.actionRecords.finish(CommonTypes.Action.add);

    props.reload();
  };

  return (
    <section
      role="create_shapes"
      className="absolute -top-4 -translate-y-full left-1/2 -translate-x-1/2"
    >
      <div className="flex bg-white-500 p-1 shadow-md rounded-md">
        {createShapeButtons.map((createShapeButton) => (
          <SquareButton
            size={40}
            content={createShapeButton.icon}
            onClick={(e) => {
              onClickCreateShapeButton(e, createShapeButton.type);
            }}
            onKeyDown={(e) => {
              e.preventDefault();
              return false;
            }}
          />
        ))}
      </div>
    </section>
  );
}
