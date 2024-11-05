"use client";
import React, { useState, ChangeEvent } from "react";
import DataBox from "@/blocks/indivisualSidePanel/dataBox";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import Divider from "@/components/divider";
import { cloneDeep } from "lodash";
import * as handleUtils from "@/utils/handle";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/select";
import * as IconTypes from "@/types/components/icon";
import * as PageIdTypes from "@/types/app/pageId";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as ButtonTypes from "@/types/components/button";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";

export default function IndivisualSidePanel(
  props: IndivisaulSidePanelTypes.Props
) {
  const [isEditingIndivisual, setIsEditingIndivisual] = useState(false);
  const [addImportDatas, setAddImportDatas] =
    useState<PageIdTypes.AddImportDatas>([]);
  const [newImportDatas, setNewImportDatas] = useState<
    { val: string; comment: null | string; status: null | InputTypes.Status }[]
  >([]);
  const [addUsingDatas, setAddUsingDatas] = useState<(null | string)[]>([]);
  const [newUsingDatas, setNewUsingDatas] = useState<(null | string)[]>([]);
  const [addRemoveDatas, setAddRemoveDatas] = useState<(null | string)[]>([]);
  const [newRemoveDatas, setNewRemoveDatas] = useState<(null | string)[]>([]);

  const dataOptions = props.datas.map((data) => data.name);

  const onClickIndivisualSidePanelSwitch: SidePanelTypes.Props["onClickSwitch"] =
    (e) => {
      e.preventDefault();
      props.setIsIndivisualSidePanelOpen((open) => !open);
    };

  const onClickEditIndivisualIcon = () => {
    setIsEditingIndivisual(true);
  };

  const onClickCancelEditIndivisualButton = () => {
    setAddImportDatas([]);
    setNewImportDatas([]);
    setAddUsingDatas([]);
    setNewUsingDatas([]);
    setAddRemoveDatas([]);
    setNewRemoveDatas([]);
    setIsEditingIndivisual(false);
  };

  const onClickSaveIndivisualButton = () => {
    const validateRequirement = () => {
      const _addImportDatas = cloneDeep(addImportDatas);

      _addImportDatas.forEach((_addImportData) => {
        if (!!_addImportData.val) return;
        _addImportData.comment = "required!";
        _addImportData.status = InputTypes.Status.error;
      });

      return { addImportDatas: _addImportDatas };
    };

    const validateRepetition = (lastResult: {
      addImportDatas: PageIdTypes.AddImportDatas;
    }) => {
      const map: { [data: string]: boolean } = {};

      props.indivisual?.importDatas.forEach((importData) => {
        map[importData.text] = importData.text in map;
      });

      addImportDatas.forEach((addImportData) => {
        if (!addImportData.val) return;
        map[addImportData.val] = addImportData.val in map;
      });

      newImportDatas.forEach((newImportData) => {
        if (!newImportData.val) return;
        map[newImportData.val] = newImportData.val in map;
      });

      let isPass = true;

      const _addImportDatas = lastResult.addImportDatas;

      _addImportDatas.forEach((_addImportData) => {
        if (!_addImportData.val || !map[_addImportData.val]) return;
        _addImportData.comment = "repetitive!";
        _addImportData.status = InputTypes.Status.error;
        isPass = false;
      });

      setAddImportDatas(_addImportDatas);

      const _newImportDatas = cloneDeep(newImportDatas);

      _newImportDatas.forEach((_newImportDatas) => {
        if (!_newImportDatas.val || !map[_newImportDatas.val]) return;
        _newImportDatas.comment = "repetitive!";
        _newImportDatas.status = SelectTypes.Status.error;
        isPass = false;
      });

      setNewImportDatas(_newImportDatas);

      return isPass;
    };

    handleUtils.handle([validateRequirement, validateRepetition]);
  };

  return (
    <SidePanel
      role={"indivisual"}
      open={props.isIndivisualSidePanelOpen}
      horizentalD={SidePanelTypes.HorizentalD.r}
      verticalD={SidePanelTypes.VerticalD.b}
      w={"360px"}
      h={"calc(100vh)"}
      onClickSwitch={onClickIndivisualSidePanelSwitch}
    >
      <div className={"p-4 h-full"}>
        {isEditingIndivisual ? (
          <div className="flex justify-end items-center" role="edit_indivisual">
            <Button
              role="cancel_edit_indivisual"
              vice
              text="Cancel"
              className="ms-2"
              size={ButtonTypes.Size.sm}
              onClick={onClickCancelEditIndivisualButton}
            />
            <Button
              role="save_edit_indivisual"
              text="Save"
              className="ms-2"
              size={ButtonTypes.Size.sm}
              onClick={onClickSaveIndivisualButton}
            />
          </div>
        ) : (
          <Icon
            role="begin_edit_indivisual"
            className={"justify-self-end cursor-pointer"}
            type={IconTypes.Type.pencilSquare}
            w={16}
            h={16}
            disabled={!props.indivisual}
            onClick={onClickEditIndivisualIcon}
          />
        )}
        <div className="flex flex-col h-full">
          <div>
            <p className="text-sm px-1">title</p>
            {isEditingIndivisual ? (
              <Input
                value={props.indivisual?.title}
                // onChange={onChangeTitle}
              />
            ) : (
              <p className="text-black-2 px-3 py-1">
                {props.indivisual?.title || "none"}
              </p>
            )}
          </div>
          <DataBox
            className="flex-1"
            text={"Import Data"}
            isEditing={isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.importDatas || []}
            addDatas={addImportDatas}
            setAddDatas={setAddImportDatas}
            newDatas={newImportDatas}
            setNewDatas={setNewImportDatas}
          />
          {/* TODO: split Using Data / Remove Data */}
          <Divider text={"Using Data"} />
          <section className="flex-1 mb-2 pb-4">
            <div className="px-1">
              {/* <div
                  className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                // onClick={onClickPlus}
                >
                  +
                </div> */}
              {props.indivisual?.usingDatas &&
              props.indivisual?.usingDatas.length > 0 ? (
                props.indivisual.usingDatas.map((usingData, i) => (
                  <div className={`flex flex-col mt-${i !== 0 ? "2" : "0"}`}>
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="full-name"
                        name="full-name"
                        className={`w-full h-[28px] bg-white rounded border 
                        ${false ? "border-red-500" : "border-gray-300"}
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
                        value={usingData.text}
                        // onChange={(e) => {
                        //   onChangeData(e, i);
                        // }}
                      />
                      <div
                        className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full text-white-500 bg-primary-500 flex-shrink-0 cursor-pointer"
                        // onClick={() => {
                        //   onClickMinus(usingData.id);
                        // }}
                      >
                        -
                      </div>
                    </div>
                    {/* {false && (
                      <span className="text-red-500">{warning.data[i]}</span>
                    )} */}
                  </div>
                ))
              ) : (
                <p className="text-black-2">none</p>
              )}
            </div>
          </section>
          <Divider text={"Remove Data"} />
          <section className="flex-1 mb-2 pb-4">
            <div className="px-1">
              {/* <div
                  className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                // onClick={onClickPlus}
                >
                  +
                </div> */}
              {props.indivisual?.removeDatas &&
              props.indivisual?.removeDatas.length > 0 ? (
                props.indivisual.removeDatas.map((removeData, i) => (
                  <div className={`flex flex-col mt-${i !== 0 ? "2" : "0"}`}>
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="full-name"
                        name="full-name"
                        className={`w-full h-[28px] bg-white rounded border 
                        ${false ? "border-red-500" : "border-gray-300"}
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
                        value={removeData.text}
                        // onChange={(e) => {
                        //   onChangeData(e, i);
                        // }}
                      />
                      <div
                        className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full text-white-500 bg-primary-500 flex-shrink-0 cursor-pointer"
                        // onClick={() => {
                        //   onClickMinus(removeData.id);
                        // }}
                      >
                        -
                      </div>
                    </div>
                    {/* {false && (
                      <span className="text-red-500">{warning.data[i]}</span>
                    )} */}
                  </div>
                ))
              ) : (
                <p className="text-black-2">none</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </SidePanel>
  );
}
