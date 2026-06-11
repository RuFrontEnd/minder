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
      className="z-[60]"
      open={props.isOverAllSidePanelOpen}
      w={"360px"}
      h={"calc(-65px + 100vh)"}
      verticalD={SidePanelTypes.VerticalD.b}
      onClickSwitch={onClickOverallSidePanelSwitch}
    >
      <div>
        <div className="flex border-b border-grey-5">
          <h3
            className={`flex-1 flex justify-center text-lg font-semibold py-2 px-5 border-b-2 border-secondary-500 text-black-2`}
          >
            <span>Step</span>
          </h3>
        </div>
      </div>

      <ul
        style={{ height: "calc(100% - 52px)" }}
        className="overflow-y-auto overflow-x-hidden p-2"
      >
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
                <li key={step.id}>
                  <Accordion
                    showArrow={false}
                    title={
                      <div className="flex items-center">
                        <div className="basis-[20px]">
                          <Icon
                            type={icon.type}
                            w={20}
                            h={20}
                            fill={icon.color}
                          />
                        </div>
                        <div className="basis-full">
                          <p className="ms-2">{step.title}</p>
                        </div>
                      </div>
                    }
                    hoverRender={
                      <Icon
                        className="cursor-pointer justify-end items-center"
                        type={IconTypes.Type.sight}
                        w={18}
                        h={18}
                        stroke={tailwindColors.error["500"]}
                        onClick={() => {
                          onClickPositioningButton(step.p);
                        }}
                      />
                    }
                  />
                </li>
              );
            })}
      </ul>

      {/* TODO: project name */}
      {/* <div
        className="absolute top-0 -right-20 translate-x-full text-base"
        role="project_name"
      >
        <div className="relative bg-white-500 px-5 py-1 rounded-lg shadow-md">
          <nav
            className="cursor-pointer flex items-center relative [&:hover>div:nth-child(2)]:translate-x-full [&:hover>div:nth-child(2)]:opacity-100 transition ease-in-out duration-150"
            onClick={onClickProjectName}
          >
            <a className="text-grey-1">{props.projectName.val}</a>
            <div className="absolute right-0 translate-x-[0px] opacity-0 transition ease-in-out duration-150 ps-1">
              <PencilSquareIcon
                width={20}
                height={20}
                fill={tailwindColors.white["500"]}
              />
            </div>
          </nav>
          <motion.div
            className={`${
              isRenameFrameOpen ? "block" : "hidden"
            } absolute top-9 left-0 -translate-x-1/2 translate-y-full`}
            variants={{
              open: {
                display: "block",
                opacity: 1,
                y: "4px",
              },
              closed: {
                transitionEnd: {
                  display: "none",
                },
                opacity: 0,
                y: "-2px",
              },
            }}
            initial={isRenameFrameOpen ? "open" : "closed"}
            animate={isRenameFrameOpen ? "open" : "closed"}
            transition={{ type: "easeInOut", duration: 0.15 }}
          >
            <Frame className={"w-[240px] p-2"} role="frame">
              <div className="flex">
                <Input
                  value={props.projectName.inputVal}
                  onChange={onChangeProjectName}
                />
                <SimpleButton
                  className="px-2"
                  text="Save"
                  onClick={onClickSaveProjectNameButton}
                />
              </div>
            </Frame>
          </motion.div>
        </div>
      </div> */}
    </SidePanel>
  );
}
