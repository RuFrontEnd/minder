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
import styles from './index.module.css';

const NoData = (
  <div className={styles.root}>
    <div className={styles.root}>
      <p className={styles.root}>No Data</p>
    </div>
  </div>
);

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
        <div className={styles.root}>
          <SimpleButton
            role="create_data"
            onClick={onClickCreateDataButton}
            text="Create"
            size={SimpleButtonTypes.Size.sm}
          />
          <div className={styles.root}/>
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
        className={styles.root}style={{ height: "calc(100% - 52px)" }}
      >
        {props.isEditing ? (
          <>
            {props.createDatas.length === 0 && props.addDatas.length === 0 ? (
              <>{NoData}</>
            ) : (
              <>
                {props.createDatas.map((createData, createDataI) => (
                  <li className={styles.root}>
                    <Input
                      className={styles.root}placeholder={"input data name"}
                      value={createData.val}
                      onChange={(e) => {
                        onChangeCreateDataButton(e, createDataI);
                      }}
                      comment={createData.comment}
                      status={createData.status}
                    />
                    <Icon
                      className={styles.root}type={IconTypes.Type.x}
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
                  <li className={styles.root}>
                    <Select
                      className={styles.root}options={props.options}
                      value={addData.val}
                      placeholder={"select data"}
                      onChange={(e) => {
                        onChangeAddDataButton(e, addDataI);
                      }}
                      comment={addData.comment}
                      status={addData.status}
                    />
                    <Icon
                      className={styles.root}type={IconTypes.Type.x}
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
            )}
          </>
        ) : (
          <>
            {props.datas.length === 0 ? (
              <>{NoData}</>
            ) : (
              <>
                {props.datas.map((data) => (
                  <li className={styles.root}>
                    <StatusText text={data.text} status={data.status} />
                  </li>
                ))}
              </>
            )}
          </>
        )}
      </ul>
    </section>
  );
}
