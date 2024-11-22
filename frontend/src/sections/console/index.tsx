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

let worker: null | Worker = null;

export default function Console(
  props: any
  // IndivisaulSidePanelTypes.Props
) {
  const [isOpenConsole, setIsOpenConsole] = useState(false)
  return (
    <SidePanel
      role={"indivisual"}
      open={isOpenConsole}
      flow={SidePanelTypes.Flow.column}
      horizentalD={SidePanelTypes.HorizentalD.m}
      verticalD={SidePanelTypes.VerticalD.b}
      w={"calc(100vh)"}
      h={"360px"}
      onClickSwitch={()=>{setIsOpenConsole(isOpenConsole => !isOpenConsole)}}
    ></SidePanel>
  );
}
