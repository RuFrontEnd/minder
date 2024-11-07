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
import * as CommonTypes from "@/types/common";

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
  const [createDeleteDatas, setCreateDeleteDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addDeleteDatas, setAddDeleteDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);

  const dataOptions = props.datas.map((data) => data.name);

  const closeEditing = () => {
    setCreateImportDatas([]);
    setAddImportDatas([]);
    setCreateUsingDatas([]);
    setAddUsingDatas([]);
    setCreateDeleteDatas([]);
    setAddDeleteDatas([]);
    setIsEditingIndivisual(false);
  };

  const onClickSidePanelSwitch: SidePanelTypes.Props["onClickSwitch"] = (e) => {
    e.preventDefault();
    props.setIsIndivisualSidePanelOpen((open) => !open);
  };

  const onClickEditIcon = () => {
    if (props.indivisual?.importDatas) {
      setCreateImportDatas(
        props.indivisual.importDatas.map((data) => ({
          val: data.text,
          comment: null,
          status: null,
        }))
      );
    }

    setIsEditingIndivisual(true);
  };

  const onClickCancelButton = () => {
    closeEditing();
  };

  const onClickSaveButton = () => {
    const getUnfilledDatas = () => {
      const _createImportDatas = cloneDeep(createImportDatas);
      const _createUsingDatas = cloneDeep(createUsingDatas);
      const _createDeleteDatas = cloneDeep(createDeleteDatas);

      _createImportDatas.forEach((_datas) => {
        _datas.status = null;

        if (!!_datas.val) return;
        _datas.comment = "required!";
        _datas.status = InputTypes.Status.error;
      });

      _createUsingDatas.forEach((_datas) => {
        _datas.status = null;

        if (!!_datas.val) return;
        _datas.comment = "required!";
        _datas.status = InputTypes.Status.error;
      });

      _createDeleteDatas.forEach((_datas) => {
        _datas.status = null;

        if (!!_datas.val) return;
        _datas.comment = "required!";
        _datas.status = InputTypes.Status.error;
      });

      return {
        createImportDatas: _createImportDatas,
        createUsingDatas: _createUsingDatas,
        createDeleteDatas: _createDeleteDatas,
      };
    };

    const getRepetitiveDatas = (lastResult: {
      createImportDatas: IndivisaulSidePanelTypes.CreateDatas;
      createUsingDatas: IndivisaulSidePanelTypes.CreateDatas;
      createDeleteDatas: IndivisaulSidePanelTypes.CreateDatas;
    }) => {
      const importMap: { [data: string]: boolean } = {};
      const usingMap: { [data: string]: boolean } = {};
      const deleteMap: { [data: string]: boolean } = {};

      createImportDatas.forEach((data) => {
        if (!data.val) return;
        importMap[data.val] = data.val in importMap;
      });

      addImportDatas.forEach((data) => {
        if (!data.val) return;
        importMap[data.val] = data.val in importMap;
      });

      createUsingDatas.forEach((data) => {
        if (!data.val) return;
        usingMap[data.val] = data.val in usingMap;
      });

      addUsingDatas.forEach((data) => {
        if (!data.val) return;
        usingMap[data.val] = data.val in usingMap;
      });

      createDeleteDatas.forEach((data) => {
        if (!data.val) return;
        deleteMap[data.val] = data.val in deleteMap;
      });

      addDeleteDatas.forEach((data) => {
        if (!data.val) return;
        deleteMap[data.val] = data.val in deleteMap;
      });

      const _createImportDatas = lastResult.createImportDatas;
      const _createUsingDatas = lastResult.createUsingDatas;
      const _createDeleteDatas = lastResult.createDeleteDatas;

      _createImportDatas.forEach((data) => {
        if (!data.val || !importMap[data.val]) return;
        data.comment = "repetitive!";
        data.status = InputTypes.Status.error;
      });

      _createUsingDatas.forEach((data) => {
        if (!data.val || !usingMap[data.val]) return;
        data.comment = "repetitive!";
        data.status = InputTypes.Status.error;
      });

      _createDeleteDatas.forEach((data) => {
        if (!data.val || !deleteMap[data.val]) return;
        data.comment = "repetitive!";
        data.status = InputTypes.Status.error;
      });

      const _addImportDatas = cloneDeep(addImportDatas);
      const _addUsingDatas = cloneDeep(addUsingDatas);
      const _addDeleteDatas = cloneDeep(addDeleteDatas);

      _addImportDatas.forEach((data) => {
        data.status = null;

        if (!data.val || !importMap[data.val]) return;
        data.comment = "repetitive!";
        data.status = SelectTypes.Status.error;
      });

      _addUsingDatas.forEach((data) => {
        data.status = null;

        if (!data.val || !usingMap[data.val]) return;
        data.comment = "repetitive!";
        data.status = SelectTypes.Status.error;
      });

      _addDeleteDatas.forEach((data) => {
        data.status = null;

        if (!data.val || !deleteMap[data.val]) return;
        data.comment = "repetitive!";
        data.status = SelectTypes.Status.error;
      });

      console.log("importMap", importMap);

      return {
        createImportDatas: _createImportDatas,
        createUsingDatas: _createUsingDatas,
        createDeleteDatas: _createDeleteDatas,
        addImportDatas: _addImportDatas,
        addUsingDatas: _addUsingDatas,
        addDeleteDatas: _addDeleteDatas,
      };
    };

    const validate = (lastResult: {
      createImportDatas: IndivisaulSidePanelTypes.CreateDatas;
      createUsingDatas: IndivisaulSidePanelTypes.CreateDatas;
      createDeleteDatas: IndivisaulSidePanelTypes.CreateDatas;
      addImportDatas: IndivisaulSidePanelTypes.AddDatas;
      addUsingDatas: IndivisaulSidePanelTypes.AddDatas;
      addDeleteDatas: IndivisaulSidePanelTypes.AddDatas;
    }) => {
      if (
        lastResult.createImportDatas.findIndex(
          (data) => data.status === InputTypes.Status.error
        ) > -1 ||
        lastResult.createUsingDatas.findIndex(
          (data) => data.status === InputTypes.Status.error
        ) > -1 ||
        lastResult.createDeleteDatas.findIndex(
          (data) => data.status === InputTypes.Status.error
        ) > -1 ||
        lastResult.addImportDatas.findIndex(
          (data) => data.status === InputTypes.Status.error
        ) > -1 ||
        lastResult.addUsingDatas.findIndex(
          (data) => data.status === InputTypes.Status.error
        ) > -1 ||
        lastResult.addDeleteDatas.findIndex(
          (data) => data.status === InputTypes.Status.error
        ) > -1
      ) {
        setCreateImportDatas(lastResult.createImportDatas);
        setCreateUsingDatas(lastResult.createUsingDatas);
        setCreateDeleteDatas(lastResult.createDeleteDatas);
        setAddImportDatas(lastResult.addImportDatas);
        setAddUsingDatas(lastResult.addUsingDatas);
        setAddDeleteDatas(lastResult.addDeleteDatas);
        return false;
      }

      return {
        createImportDatas: lastResult.createImportDatas,
        createUsingDatas: lastResult.createUsingDatas,
        createDeleteDatas: lastResult.createDeleteDatas,
        addImportDatas: lastResult.addImportDatas,
        addUsingDatas: lastResult.addUsingDatas,
        addDeleteDatas: lastResult.addDeleteDatas,
      };
    };

    const setDatasToShape = (lastResult: {
      createImportDatas: IndivisaulSidePanelTypes.CreateDatas;
      createUsingDatas: IndivisaulSidePanelTypes.CreateDatas;
      createDeleteDatas: IndivisaulSidePanelTypes.CreateDatas;
      addImportDatas: IndivisaulSidePanelTypes.AddDatas;
      addUsingDatas: IndivisaulSidePanelTypes.AddDatas;
      addDeleteDatas: IndivisaulSidePanelTypes.AddDatas;
    }) => {
      if (!props.indivisual) return false;
      const _importDatas: CommonTypes.Datas = [];
      const _usingDatas: CommonTypes.Datas = [];
      const _deleteDatas: CommonTypes.Datas = [];

      for (let i = 0; i < lastResult.createImportDatas.length; i++) {
        const data = lastResult.createImportDatas[i];
        if (!data.val) return false;

        _importDatas.push({
          id: data.val,
          text: data.val,
          status: CommonTypes.DataStatus.default,
        });
      }

      for (let i = 0; i < lastResult.addImportDatas.length; i++) {
        const data = lastResult.addImportDatas[i];
        if (!data.val) return false;

        _importDatas.push({
          id: data.val,
          text: data.val,
          status: CommonTypes.DataStatus.default,
        });
      }

      for (let i = 0; i < lastResult.createUsingDatas.length; i++) {
        const data = lastResult.createUsingDatas[i];
        if (!data.val) return false;

        _usingDatas.push({
          id: data.val,
          text: data.val,
          status: CommonTypes.DataStatus.default,
        });
      }

      for (let i = 0; i < lastResult.addUsingDatas.length; i++) {
        const data = lastResult.addUsingDatas[i];
        if (!data.val) return false;

        _usingDatas.push({
          id: data.val,
          text: data.val,
          status: CommonTypes.DataStatus.default,
        });
      }

      for (let i = 0; i < lastResult.createDeleteDatas.length; i++) {
        const data = lastResult.createDeleteDatas[i];
        if (!data.val) return false;

        _deleteDatas.push({
          id: data.val,
          text: data.val,
          status: CommonTypes.DataStatus.default,
        });
      }

      for (let i = 0; i < lastResult.addDeleteDatas.length; i++) {
        const data = lastResult.addDeleteDatas[i];
        if (!data.val) return false;

        _deleteDatas.push({
          id: data.val,
          text: data.val,
          status: CommonTypes.DataStatus.default,
        });
      }

      props.indivisual.importDatas = _importDatas;
      props.indivisual.usingDatas = _usingDatas;
      props.indivisual.deleteDatas = _deleteDatas;
      setIsEditingIndivisual(false);
      return true;
    };

    const finishEditing = () => {
      closeEditing();
      return false;
    };

    handleUtils.handle([
      getUnfilledDatas,
      getRepetitiveDatas,
      validate,
      setDatasToShape,
      finishEditing,
    ]);
  };

  return (
    <SidePanel
      role={"indivisual"}
      open={props.isIndivisualSidePanelOpen}
      horizentalD={SidePanelTypes.HorizentalD.r}
      verticalD={SidePanelTypes.VerticalD.b}
      w={"360px"}
      h={"calc(100vh)"}
      onClickSwitch={onClickSidePanelSwitch}
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
              onClick={onClickCancelButton}
            />
            <Button
              role="save_edit_indivisual"
              text="Save"
              className="ms-2"
              size={ButtonTypes.Size.sm}
              onClick={onClickSaveButton}
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
            onClick={onClickEditIcon}
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
                {props.indivisual?.title || "-"}
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
            datas={props.indivisual?.usingDatas || []}
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
            datas={props.indivisual?.deleteDatas || []}
            createDatas={createDeleteDatas}
            setCreateDatas={setCreateDeleteDatas}
            addDatas={addDeleteDatas}
            setAddDatas={setAddDeleteDatas}
          />
        </div>
      </div>
    </SidePanel>
  );
}
