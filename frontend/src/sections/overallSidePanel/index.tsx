"use client";
import React, { useState } from "react";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import SidePanel from "@/components/sidePanel";
import Accordion from "@/components/accordion";
import SimpleButton from "@/components/simpleButton";
import Input from "@/components/input";
import Frame from "@/components/frame";
import PencilSquareIcon from "@/assets/svg/pencil-square.svg";
import Icon from "@/components/icon";
import { motion } from "framer-motion";
import { cloneDeep } from "lodash";
import { ChangeEventHandler, MouseEventHandler } from "react";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";
import * as OverallSidePanelTypes from "@/types/sections/id/overallSidePanel";
import * as InputTypes from "@/types/components/input";
import * as IconTypes from "@/types/components/icon";
import * as PageIdTypes from "@/types/app/pageId";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as SimpleButtonTypes from "@/types/components/simpleButton";

export default function OverallSidePanel(props: OverallSidePanelTypes.Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenameFrameOpen, setIsRenameFrameOpen] = useState(false);
  const [type, setType] = useState(PageIdTypes.OverallType.step);
  const [createDataValue, setCreateDataValue] = useState<null | string>(null);

  const onClickOverallSidePanelSwitch = () => {
    setIsOpen((open) => !open);
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

  const onClickOverallSidePanelTab = (e: React.MouseEvent<HTMLDivElement>) => {
    const dataTab = (e.target as HTMLElement | null)
      ?.closest("[data-tab]")
      ?.getAttribute("data-tab");

    const isOverallType = (value: any): value is PageIdTypes.OverallType =>
      Object.values(PageIdTypes.OverallType).includes(value);

    if (!dataTab || !isOverallType(dataTab)) return;

    setType(dataTab);
  };

  const onChangeCreateDataInput: InputTypes.Props["onChange"] = (e) => {
    setCreateDataValue(e.target.value);
  };

  const onClickCreateDataButton = () => {
    if (!createDataValue) return;

    if (props.datas.findIndex((data) => data.name === createDataValue) !== -1) {
      setCreateDataValue(null);
      return;
    }

    const _datas = cloneDeep(props.datas);

    _datas.push({ id: Math.random().toString(), name: createDataValue }); // TODO: should be revised into post to backend

    props.setDatas(_datas);

    setCreateDataValue(null);
  };

  const onDeleteDataButton = (dataName: string) => {
    const newDatas = cloneDeep(props.datas).filter(
      (data) => data.name !== dataName
    );
    props.setDatas(newDatas);

    // sync with shapes
    const map: { [data: string]: boolean } = {};
    newDatas.forEach((newData) => {
      map[newData.name] = true;
    });
    const newShapes = cloneDeep(props.shapes);
    newShapes.forEach((shape) => {
      shape.usingDatas = shape.usingDatas.filter((data) => map[data.text]);
      shape.importDatas = shape.importDatas.filter((data) => map[data.text]);
      shape.deleteDatas = shape.deleteDatas.filter((data) => map[data.text]);
    });
    props.updateShapes(newShapes);
  };

  return (
    <SidePanel
      open={isOpen}
      w={"360px"}
      h={"calc(100vh)"}
      verticalD={SidePanelTypes.VerticalD.b}
      onClickSwitch={onClickOverallSidePanelSwitch}
    >
      <div>
        <div
          className="flex border-b border-grey-5 cursor-pointer"
          onClick={(e) => {
            onClickOverallSidePanelTab(e);
          }}
        >
          <h3
            data-tab={PageIdTypes.OverallType.step}
            className={`flex-1 flex justify-center text-lg font-semibold py-2 px-5 ${
              type === PageIdTypes.OverallType.step
                ? "border-b-2 border-secondary-500 text-black-2"
                : "border-b-1 text-grey-4"
            }`}
          >
            <span>Step</span>
          </h3>
          <div className="border-r border-grey-5" />
          <h3
            data-tab={PageIdTypes.OverallType.data}
            className={`flex-1 flex justify-center text-lg font-semibold py-2 px-5 ${
              type === PageIdTypes.OverallType.data
                ? "border-b-2 border-secondary-500 text-black-2"
                : "border-b-1 text-grey-4"
            }`}
          >
            <span>Data</span>
          </h3>
        </div>
      </div>

      <ul
        style={{ height: "calc(100% - 52px)" }}
        className="overflow-y-auto overflow-x-hidden p-2"
      >
        {type === PageIdTypes.OverallType.step && (
          <>
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
                        <Icon
                          type={icon.type}
                          w={20}
                          h={20}
                          fill={icon.color}
                        />
                        <p className="ms-2">{step.title}</p>
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
          </>
        )}
        {type === PageIdTypes.OverallType.data && (
          <>
            <div className="flex m-2">
              <Input
                className="flex-1"
                value={createDataValue}
                onChange={onChangeCreateDataInput}
              />
              <SimpleButton
                text="Create"
                className="ms-3 me-1"
                size={SimpleButtonTypes.Size.md}
                onClick={onClickCreateDataButton}
              />
            </div>
            {props.datas.map((data) => (
              <li key={data.id}>
                <Accordion
                  showArrow={false}
                  title={
                    <div className="flex items-center">
                      <p className="ms-2">{data.name}</p>
                    </div>
                  }
                  hoverRender={
                    <Icon
                      className="cursor-pointer"
                      type={IconTypes.Type.x}
                      w={16}
                      h={24}
                      stroke={tailwindColors.error["500"]}
                      onClick={() => {
                        onDeleteDataButton(data.name);
                      }}
                    />
                  }
                />
              </li>
            ))}
          </>
        )}
      </ul>

      <div
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
      </div>
    </SidePanel>
  );
}
