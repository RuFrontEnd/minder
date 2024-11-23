"use client";
import React, { useState, ChangeEvent } from "react";
import Zoom from "@/sections/zoom";
import DataBox from "@/blocks/indivisualSidePanel/dataBox";
import SidePanel from "@/components/sidePanel";
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

export default function Console(
  props: any
  // IndivisaulSidePanelTypes.Props
) {
  const [isOpenConsole, setIsOpenConsole] = useState(false);

  const onClickUndoButton = () => {
    props.undo();
  };

  return (
    <SidePanel
      role={"console"}
      open={isOpenConsole}
      flow={SidePanelTypes.Flow.column}
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
        setIsOpenConsole((isOpenConsole) => !isOpenConsole);
      }}
    >
      <div className="absolute top-0 right-0 -translate-y-full pb-4 flex">
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
