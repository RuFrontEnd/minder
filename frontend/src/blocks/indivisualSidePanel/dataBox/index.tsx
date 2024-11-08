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
  const onClickCreateDataButton = () => {
    const _createDatas = cloneDeep(props.createDatas);

    _createDatas.push({ val: null, comment: null, status: null });

    props.setCreateDatas(_createDatas);
  };

  const onChangeCreateDataButton = (
    e: ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const _createDatas = cloneDeep(props.createDatas);

    _createDatas[i] = { val: e.target.value, comment: null, status: null };

    props.setCreateDatas(_createDatas);
  };

  const onRemoveCreateDataButton = (i: number) => {
    const _createDatas = cloneDeep(props.createDatas);

    _createDatas.splice(i, 1);

    props.setCreateDatas(_createDatas);
  };

  const onClickAddDataButton = () => {
    const _addDatas = cloneDeep(props.addDatas);

    _addDatas.push({ val: props.options[0], comment: null, status: null });

    props.setAddDatas(_addDatas);
  };

  const onChangeAddDataButton = (
    e: ChangeEvent<HTMLSelectElement>,
    i: number
  ) => {
    const _addDatas = cloneDeep(props.addDatas);

    _addDatas[i] = { val: e.target.value, comment: null, status: null };

    props.setAddDatas(_addDatas);
  };

  const onRemoveAddDataButton = (i: number) => {
    const _addDatas = cloneDeep(props.addDatas);

    _addDatas.splice(i, 1);

    props.setAddDatas(_addDatas);
  };

  return (
    <section
      style={props.style}
      className={`${props.className && props.className} flex flex-col`}
    >
      <Divider text={props.text} />
      {props.isEditing && (
        <div className="flex items-center justify-end px-1">
          <SimpleButton
            role="create_data"
            onClick={onClickCreateDataButton}
            text="Create"
            size={SimpleButtonTypes.Size.sm}
          />
          <div className="border mx-2 h-3" />
          <SimpleButton
            role="add_data"
            onClick={onClickAddDataButton}
            text="Add"
            size={SimpleButtonTypes.Size.sm}
            disabled={props.options.length === 0}
          />
        </div>
      )}
      <ul
        className="flex-1 overflow-auto"
        style={{ height: "calc(100% - 52px)" }}
      >
        {props.datas.length > 0 ||
        props.createDatas.length > 0 ||
        props.addDatas.length > 0 ? (
          <>
            {props.createDatas.length > 0 || props.addDatas.length > 0 ? (
              <>
                {props.createDatas.map((createData, createDataI) => (
                  <li className="py-1 flex">
                    <Input
                      className="flex-1"
                      placeholder={"input data name"}
                      value={createData.val}
                      onChange={(e) => {
                        onChangeCreateDataButton(e, createDataI);
                      }}
                      comment={createData.comment}
                      status={createData.status}
                    />
                    <Icon
                      className="m-1 cursor-pointer"
                      type={IconTypes.Type.x}
                      w={16}
                      h={24}
                      stroke={tailwindColors.error["500"]}
                      onClick={(e) => {
                        onRemoveCreateDataButton(createDataI);
                      }}
                    />
                  </li>
                ))}
                {props.addDatas.map((addData, addDataI) => (
                  <li className="py-1 flex">
                    <Select
                      className="flex-1"
                      options={props.options}
                      value={addData.val}
                      placeholder={"select data"}
                      onChange={(e) => {
                        onChangeAddDataButton(e, addDataI);
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
                        onRemoveAddDataButton(addDataI);
                      }}
                    />
                  </li>
                ))}
              </>
            ) : (
              <>
                {props.datas.map((data) => (
                  <li className="px-3 py-1 hover:bg-grey-5">
                    <StatusText text={data.text} status={data.status} />
                  </li>
                ))}
              </>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center h-full p-1">
            <div className="flex-1 flex justify-center items-center h-full bg-grey-7 rounded-md">
              <p className="text-black-2 text-grey-4">No Data</p>
            </div>
          </div>
        )}
      </ul>
    </section>
  );
}
