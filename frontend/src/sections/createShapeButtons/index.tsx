"use client";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import SquareButton from "@/components/squareButton";
import Icon from "@/components/icon";
import { MouseEvent } from "react";
import { tailwindColors } from "@/variables/colors";
import { v4 as uuidv4 } from "uuid";
import * as IconTypes from "@/types/components/icon";
import * as CommonTypes from "@/types/common";
import * as CreateShapeButtonsTypes from "@/types/sections/id/createShapeButtons";

const isBrowser = typeof window !== "undefined";

export default function CreateShapeButtons(
  props: CreateShapeButtonsTypes.Props
) {
  const createShapeButtons = [
    {
      shape: CommonTypes.ShapeType["terminator"],
      icon: IconTypes.Type.ellipse,
      size: 24,
      color: tailwindColors.shape.terminal,
    },
    {
      shape: CommonTypes.ShapeType["process"],
      icon: IconTypes.Type.square,
      size: 24,
      color: tailwindColors.shape.process,
    },
    {
      shape: CommonTypes.ShapeType["data"],
      icon: IconTypes.Type.parallelogram,
      size: 24,
      color: tailwindColors.shape.data,
    },
    {
      shape: CommonTypes.ShapeType["decision"],
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
    type: CommonTypes.ShapeType,
    offset: CommonTypes.Vec,
    scale: number = 1
  ) => {
    const initPosition = {
      x: -offset.x + window.innerWidth / 2 / scale,
      y: -offset.y + window.innerHeight / 2 / scale,
    };
    switch (type) {
      case CommonTypes.ShapeType["terminator"]:
        return new Terminal(
          `${type}_${uuidv4()}`,
          props.initShapeSize.t.w,
          props.initShapeSize.t.h,
          initPosition,
          type
        );
      case CommonTypes.ShapeType["process"]:
        return new Process(
          `${type}_${uuidv4()}`,
          props.initShapeSize.p.w,
          props.initShapeSize.p.h,
          initPosition,
          type
        );

      case CommonTypes.ShapeType["data"]:
        return new Data(
          `${type}_${uuidv4()}`,
          props.initShapeSize.d.w,
          props.initShapeSize.d.h,
          initPosition,
          type
        );

      case CommonTypes.ShapeType["decision"]:
        return new Desicion(
          `${type}_${uuidv4()}`,
          props.initShapeSize.dec.w,
          props.initShapeSize.dec.h,
          initPosition,
          type
        );
    }
  };

  const onClickCreateShapeButton = (
    e: MouseEvent<HTMLButtonElement>,
    type: CommonTypes.ShapeType
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
    <section role="create_shapes">
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
