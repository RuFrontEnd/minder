"use client";
import React, { ChangeEvent } from "react";
import SimpleButton from "@/components/simpleButton";
import Input from "@/components/input";
import Select from "@/components/select";
import Icon from "@/components/icon";
import StatusText from "@/components/statusText";
import Divider from "@/components/divider";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import * as IconTypes from "@/types/components/icon";
import * as SimpleButtonTypes from "@/types/components/simpleButton";
import * as DataBoxTypes from "@/types/blocks/indivisualSidePanel/dataBox";

export default function DataBox(props: DataBoxTypes.Props) {
  const onClickAddImportDataButton = () => {
    const _addDatas = cloneDeep(props.addDatas);

    _addDatas.push({ val: null, comment: null, status: null });

    props.setAddDatas(_addDatas);
  };

  const onChangeAddImportDataButton = (
    e: ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const _addDatas = cloneDeep(props.addDatas);

    _addDatas[i] = { val: e.target.value, comment: null, status: null };

    props.setAddDatas(_addDatas);
  };

  const onRemoveAddImportDataButton = (i: number) => {
    const _addDatas = cloneDeep(props.addDatas);

    _addDatas.splice(i, 1);

    props.setAddDatas(_addDatas);
  };

  const onClickNewImportDataButton = () => {
    const _newDatas = cloneDeep(props.newDatas);

    _newDatas.push({ val: props.options[0], comment: null, status: null });

    props.setNewDatas(_newDatas);
  };

  const onChangeNewImportDataButton = (
    e: ChangeEvent<HTMLSelectElement>,
    i: number
  ) => {
    const _newDatas = cloneDeep(props.newDatas);

    _newDatas[i] = { val: e.target.value, comment: null, status: null };

    props.setNewDatas(_newDatas);
  };

  const onRemoveNewImportDataButton = (i: number) => {
    const _newDatas = cloneDeep(props.newDatas);

    _newDatas.splice(i, 1);

    props.setNewDatas(_newDatas);
  };

  return (
    <section className={`${props.className && props.className} overflow-auto`}>
      <Divider text={props.text} />
      {props.isEditing && (
        <div className="flex items-center justify-end px-1">
          <SimpleButton
            role="add_import_data"
            onClick={onClickAddImportDataButton}
            text="Add"
            size={SimpleButtonTypes.Size.sm}
          />
          <div className="border mx-2 h-[80%]" />
          <SimpleButton
            role="new_import_data"
            onClick={onClickNewImportDataButton}
            text="New"
            size={SimpleButtonTypes.Size.sm}
          />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {props.datas.length > 0 ||
        props.addDatas.length > 0 ||
        props.newDatas.length > 0 ? (
          <ul>
            {props.datas.map((data) => (
              <li className="px-3 py-1 hover:bg-grey-5">
                <StatusText text={data.text} status={data.status} />
              </li>
            ))}
            {props.addDatas.map((addData, addDataI) => (
              <li className="py-1 flex">
                <Input
                  className="flex-1"
                  placeholder={"input data name"}
                  value={addData.val}
                  onChange={(e) => {
                    onChangeAddImportDataButton(e, addDataI);
                  }}
                  comment={addData.comment}
                  status={addData.status}
                />
                <Icon
                  className="m-1 cursor-pointer"
                  type={IconTypes.Type.x}
                  w={16}
                  h={24}
                  stroke={tailwindColors.error["500"]}
                  onClick={(e) => {
                    onRemoveAddImportDataButton(addDataI);
                  }}
                />
              </li>
            ))}
            {props.newDatas.map((newImportData, newImportDataI) => (
              <li className="py-1 flex">
                <Select
                  className="flex-1"
                  options={props.options}
                  value={newImportData.val}
                  placeholder={"select data"}
                  onChange={(e) => {
                    onChangeNewImportDataButton(e, newImportDataI);
                  }}
                  comment={newImportData.comment}
                  status={newImportData.status}
                />
                <Icon
                  className="m-1 cursor-pointer"
                  type={IconTypes.Type.x}
                  w={16}
                  h={24}
                  stroke={tailwindColors.error["500"]}
                  onClick={(e) => {
                    onRemoveNewImportDataButton(newImportDataI);
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-1 text-black-2">none</p>
        )}
      </div>
    </section>
  );
}
