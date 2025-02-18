"use client";
import React, { useState, ChangeEventHandler } from "react";
import DataBox from "@/blocks/indivisualSidePanel/dataBox";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Decision from "@/shapes/decision";
import Curve from "@/shapes/curve";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import * as handleUtils from "@/utils/handle";
import * as fileUtils from "@/utils/file";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/select";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as ButtonTypes from "@/types/components/button";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";
import * as CommonTypes from "@/types/common";

export default function IndivisualSidePanel(
  props: IndivisaulSidePanelTypes.Props
) {
  const dataOptions = props.datas.map((data) => data.name);
  const [editingTitle, setEditingTitle] = useState<null | string>(null);

  const closeEditing = () => {
    props.setCreateImportDatas([]);
    props.setAddImportDatas([]);
    props.setCreateUsingDatas([]);
    props.setAddUsingDatas([]);
    props.setCreateDeleteDatas([]);
    props.setAddDeleteDatas([]);
    props.setIsEditingIndivisual(false);
    setEditingTitle(props.indivisual?.title || null);
  };

  const onClickSidePanelSwitch: SidePanelTypes.Props["onClickSwitch"] = (e) => {
    e.preventDefault();
    props.setIsIndivisualSidePanelOpen((open) => !open);
  };

  const onClickEditIcon = () => {
    if (!props.indivisual) return false;
    setEditingTitle(props.indivisual?.title);

    if (props.indivisual?.importDatas) {
      props.setAddImportDatas(
        props.indivisual.importDatas.map((data) => ({
          val: data.text,
          comment: null,
          status: null,
        }))
      );
    }

    if (props.indivisual?.usingDatas) {
      props.setAddUsingDatas(
        props.indivisual.usingDatas.map((data) => ({
          val: data.text,
          comment: null,
          status: null,
        }))
      );
    }

    if (props.indivisual?.deleteDatas) {
      props.setAddDeleteDatas(
        props.indivisual.deleteDatas.map((data) => ({
          val: data.text,
          comment: null,
          status: null,
        }))
      );
    }

    props.setIsEditingIndivisual(true);
  };

  const onClickCancelButton = () => {
    closeEditing();
  };

  const onClickSaveEditingButton = () => {
    const getUnfilledDatas = () => {
      const _createImportDatas = cloneDeep(props.createImportDatas);
      const _createUsingDatas = cloneDeep(props.createUsingDatas);
      const _createDeleteDatas = cloneDeep(props.createDeleteDatas);

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

      props.createImportDatas.forEach((data) => {
        if (!data.val) return;
        importMap[data.val] = data.val in importMap;
      });

      props.addImportDatas.forEach((data) => {
        if (!data.val) return;
        importMap[data.val] = data.val in importMap;
      });

      props.createUsingDatas.forEach((data) => {
        if (!data.val) return;
        usingMap[data.val] = data.val in usingMap;
      });

      props.addUsingDatas.forEach((data) => {
        if (!data.val) return;
        usingMap[data.val] = data.val in usingMap;
      });

      props.createDeleteDatas.forEach((data) => {
        if (!data.val) return;
        deleteMap[data.val] = data.val in deleteMap;
      });

      props.addDeleteDatas.forEach((data) => {
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

      const _addImportDatas = cloneDeep(props.addImportDatas);
      const _addUsingDatas = cloneDeep(props.addUsingDatas);
      const _addDeleteDatas = cloneDeep(props.addDeleteDatas);

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
        props.setCreateImportDatas(lastResult.createImportDatas);
        props.setCreateUsingDatas(lastResult.createUsingDatas);
        props.setCreateDeleteDatas(lastResult.createDeleteDatas);
        props.setAddImportDatas(lastResult.addImportDatas);
        props.setAddUsingDatas(lastResult.addUsingDatas);
        props.setAddDeleteDatas(lastResult.addDeleteDatas);
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
      props.setIsEditingIndivisual(false);

      return {
        createImportDatas: lastResult.createImportDatas,
        createUsingDatas: lastResult.createUsingDatas,
        createDeleteDatas: lastResult.createDeleteDatas,
      };
    };

    const syncToOverallData = (lastResult: {
      createImportDatas: IndivisaulSidePanelTypes.CreateDatas;
      createUsingDatas: IndivisaulSidePanelTypes.CreateDatas;
      createDeleteDatas: IndivisaulSidePanelTypes.CreateDatas;
    }) => {
      const hasExistData: { [data: string]: boolean } = {};
      const newDatas = cloneDeep(props.datas);

      newDatas.forEach((data) => {
        hasExistData[data.name] = true;
      });

      const pushData = (datas: IndivisaulSidePanelTypes.CreateDatas) => {
        datas.forEach((data) => {
          if (!data.val || hasExistData[data.val]) return;
          newDatas.push({
            id: data.val,
            name: data.val,
          });

          hasExistData[data.val] = true;
        });
      };

      pushData(lastResult.createImportDatas);
      pushData(lastResult.createUsingDatas);
      pushData(lastResult.createDeleteDatas);

      props.setDatas(Array.from(newDatas));

      return true;
    };

    const reviseTitle = () => {
      if (!editingTitle || !props.indivisual) return true;

      props.indivisual.title = editingTitle;

      const _indivisual = cloneDeep(props.indivisual);
      props.setIndivisual(_indivisual);

      return true;
    };

    const finishEditing = () => {
      props.draw();
      closeEditing();
      props.terminateDataChecking();
      return false;
    };

    handleUtils.handle([
      getUnfilledDatas,
      getRepetitiveDatas,
      validate,
      setDatasToShape,
      syncToOverallData,
      reviseTitle,
      finishEditing,
    ]);
  };

  const onChangeTitle: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEditingTitle(e.target.value);
  };

  const onClickDownloadButton = () => {
    const data = {
      project: props.projectName,
      shapes: props.shapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        title: shape.title,
        p: shape.p,
        size: {
          w: shape.w,
          h: shape.h,
        },
        data: {
          import: shape.importDatas,
          using: shape.usingDatas,
          delete: shape.deleteDatas,
        },
      })),
      curves: props.curves.map((curve) => ({
        from: {
          d: curve.from.d,
          shapeId: curve.from.shape.id,
        },
        shape: {
          id: curve.shape.id,
          p1: curve.shape.p1,
          cp1: curve.shape.cp1,
          cp2: curve.shape.cp2,
          p2: curve.shape.p2,
        },
        to: { d: curve.to.d, shapeId: curve.to.shape.id },
      })),
      datas: props.datas,
      consoles: props.consoles,
    };

    fileUtils.download(
      data,
      "application/json",
      `minder_${props.projectName}_${new Date().valueOf()}.json`
    );
  };

  const onClickUploadButton = () => {
    fileUtils
      .upload("application/json")
      .then((json: CommonTypes.UploadJSON) => {
        if (
          !("consoles" in json) ||
          !("curves" in json) ||
          !("project" in json) ||
          !("shapes" in json) ||
          !("datas" in json)
        ) {
          throw new Error();
        }

        props.deSelect();

        const shapeType = {
          [CommonTypes.ShapeType.terminator]: Terminal,
          [CommonTypes.ShapeType.process]: Process,
          [CommonTypes.ShapeType.decision]: Decision,
          [CommonTypes.ShapeType.data]: Data,
        };

        const newShapes = json.shapes.map(
          (shape: CommonTypes.UploadJSON["shapes"][number]) => {
            const newShape = new shapeType[shape.type](
              shape.id,
              shape.size.w,
              shape.size.h,
              shape.p,
              shape.title
            );

            newShape.usingDatas = shape.data.using;
            newShape.importDatas = shape.data.import;
            newShape.deleteDatas = shape.data.delete;

            return newShape;
          }
        );

        const newCurves: CommonTypes.ConnectionCurves = json.curves.map(
          (curve) => {
            const newShape = {
              from: newShapes.find(
                (newShape) => newShape.id === curve.from.shapeId
              ),
              to: newShapes.find(
                (newShape) => newShape.id === curve.to.shapeId
              ),
            };

            if (!newShape.from || !newShape.to) {
              throw new Error("shape not found"); // TODO: revise to error message for user
            }

            return {
              shape: new Curve(
                curve.shape.id,
                curve.shape.p1,
                curve.shape.cp1,
                curve.shape.cp2,
                curve.shape.p2
              ),
              from: {
                shape: newShape.from,
                d: curve.from.d,
              },
              to: {
                shape: newShape.to,
                d: curve.to.d,
              },
            };
          }
        );

        props.setProjectName({ val: json.project, inputVal: json.project });
        props.updateShapes(newShapes);
        props.updateCurves(newCurves);
        props.setConsoles(json.consoles);
        props.setDatas(json.datas);
      })
      .catch(() => {
        console.error("file format is incorrect.");
      })
      .finally(() => {
        props.draw();
      });
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
        <div
          className="flex flex-col"
          style={{
            height: `calc(100% - ${props.isEditingIndivisual ? 28 : 16}px)`,
          }}
        >
          <div className="flex items-center">
            {props.isEditingIndivisual ? (
              <>
                <Input
                  role="edit_indivisual_title"
                  className="flex-1"
                  value={editingTitle}
                  onChange={onChangeTitle}
                />
                <div
                  className="flex justify-end items-center"
                  role="edit_indivisual"
                >
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
                    onClick={onClickSaveEditingButton}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="flex-1 text-md font-semibold text-black-2 px-3 py-1 min-w-0 truncate">
                  {props.indivisual?.title || "-"}
                </p>
                <Icon
                  role="begin_edit_indivisual"
                  className={"justify-self-end cursor-pointer"}
                  type={IconTypes.Type.pencilSquare}
                  w={16}
                  h={16}
                  disabled={!props.indivisual}
                  onClick={onClickEditIcon}
                />
              </>
            )}
          </div>
          <DataBox
            style={{ height: "calc(33.333% - 17.333px)" }}
            className="flex-1"
            text={"Import Data"}
            isEditing={props.isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.importDatas || []}
            createDatas={props.createImportDatas}
            setCreateDatas={props.setCreateImportDatas}
            addDatas={props.addImportDatas}
            setAddDatas={props.setAddImportDatas}
          />
          <DataBox
            style={{ height: "calc(33.333% - 17.333px)" }}
            className="flex-1"
            text={"Using Data"}
            isEditing={props.isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.usingDatas || []}
            createDatas={props.createUsingDatas}
            setCreateDatas={props.setCreateUsingDatas}
            addDatas={props.addUsingDatas}
            setAddDatas={props.setAddUsingDatas}
          />
          <DataBox
            style={{ height: "calc(33.333% - 17.333px)" }}
            className="flex-1"
            text={"Delete Data"}
            isEditing={props.isEditingIndivisual}
            options={dataOptions}
            datas={props.indivisual?.deleteDatas || []}
            createDatas={props.createDeleteDatas}
            setCreateDatas={props.setCreateDeleteDatas}
            addDatas={props.addDeleteDatas}
            setAddDatas={props.setAddDeleteDatas}
          />
        </div>
        <SquareButton
          role="upload_file"
          size={32}
          shadow
          className="absolute top-0 -left-32 -translate-x-full flex justify-self-end self-center text-base"
          content={
            <Icon
              type={IconTypes.Type.upload}
              w={16}
              h={16}
              fill={tailwindColors.grey["1"]}
            />
          }
          onClick={onClickUploadButton}
        />
        <SquareButton
          role="download_file"
          size={32}
          shadow
          className="absolute top-0 -left-20 -translate-x-full flex justify-self-end self-center text-base"
          content={
            <Icon
              type={IconTypes.Type.download}
              w={16}
              h={16}
              fill={tailwindColors.grey["1"]}
            />
          }
          onClick={onClickDownloadButton}
        />
      </div>
    </SidePanel>
  );
}
