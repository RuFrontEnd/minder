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
  const [createImportDatas, setCreateImportDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addImportDatas, setAddImportDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);
  const [createUsingDatas, setCreateUsingDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addUsingDatas, setAddUsingDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);
  const [createDeleteDatas, setCreateDelteDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addDeleteDatas, setAddDeleteDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);

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
    setCreateImportDatas([]);
    setAddImportDatas([]);
    setCreateUsingDatas([]);
    setAddUsingDatas([]);
    setCreateDelteDatas([]);
    setAddDeleteDatas([]);
    setIsEditingIndivisual(false);
  };

  const onClickSaveIndivisualButton = () => {
    const validateRequirement = () => {
      const _addImportDatas = cloneDeep(createImportDatas);

      _addImportDatas.forEach((_addImportData) => {
        if (!!_addImportData.val) return;
        _addImportData.comment = "required!";
        _addImportData.status = InputTypes.Status.error;
      });

      return { createImportDatas: _addImportDatas };
    };

    const validateRepetition = (lastResult: {
      createImportDatas: IndivisaulSidePanelTypes.CreateDatas;
    }) => {
      const map: { [data: string]: boolean } = {};

      props.indivisual?.importDatas.forEach((importData) => {
        map[importData.text] = importData.text in map;
      });

      createImportDatas.forEach((createImportData) => {
        if (!createImportData.val) return;
        map[createImportData.val] = createImportData.val in map;
      });

      addImportDatas.forEach((addImportData) => {
        if (!addImportData.val) return;
        map[addImportData.val] = addImportData.val in map;
      });

      let isPass = true;

      const _createImportDatas = lastResult.createImportDatas;

      _createImportDatas.forEach((_addImportData) => {
        if (!_addImportData.val || !map[_addImportData.val]) return;
        _addImportData.comment = "repetitive!";
        _addImportData.status = InputTypes.Status.error;
        isPass = false;
      });

      setCreateImportDatas(_createImportDatas);

      const _addImportDatas = cloneDeep(addImportDatas);

      _addImportDatas.forEach((_addImportDatas) => {
        if (!_addImportDatas.val || !map[_addImportDatas.val]) return;
        _addImportDatas.comment = "repetitive!";
        _addImportDatas.status = SelectTypes.Status.error;
        isPass = false;
      });

      setAddImportDatas(_addImportDatas);

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
        <div
          className="flex flex-col"
          style={{ height: `calc(100% - ${isEditingIndivisual ? 28 : 16}px)` }}
        >
          <div>
            <p className="text-sm px-1">title</p>
            {isEditingIndivisual ? (
              <Input
                value={props.indivisual?.title}
                // onChange={onChangeTitle}
              />
            ) : (
              <p className="text-black-2 px-3 py-1">
                {props.indivisual?.title || '-'}
              </p>
            )}
          </div>
          <DataBox
            style={{ height: "calc(33.333% - 17.333px)" }}
            className="flex-1"
            text={"Import Data"}
            isEditing={isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.importDatas || []}
            createDatas={createImportDatas}
            setCreateDatas={setCreateImportDatas}
            addDatas={addImportDatas}
            setAddDatas={setAddImportDatas}
          />
          <DataBox
            style={{ height: "calc(33.333% - 17.333px)" }}
            className="flex-1"
            text={"Using Data"}
            isEditing={isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.importDatas || []}
            createDatas={createUsingDatas}
            setCreateDatas={setCreateUsingDatas}
            addDatas={addUsingDatas}
            setAddDatas={setAddUsingDatas}
          />
          <DataBox
            style={{ height: "calc(33.333% - 17.333px)" }}
            className="flex-1"
            text={"Delete Data"}
            isEditing={isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.importDatas || []}
            createDatas={createDeleteDatas}
            setCreateDatas={setCreateDelteDatas}
            addDatas={addDeleteDatas}
            setAddDatas={setAddDeleteDatas}
          />
        </div>
      </div>
    </SidePanel>
  );
}
