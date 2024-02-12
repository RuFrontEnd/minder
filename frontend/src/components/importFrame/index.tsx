"use client";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Props } from "@/types/components/importFrame";
import { cloneDeep } from "lodash";
import { Title, Data as DataType } from "@/types/shapes/common";

export default function ImportFrame({
  id,
  key,
  coordinate,
  init,
  onConfirm,
  onClick,
}: Props) {
  const [title, setTitle] = useState<Title>(""),
    [data, setData] = useState<DataType>([]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.currentTarget.value);
    },
    onChangeData = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
      const _data = cloneDeep(data);
      _data[i].text = e.currentTarget.value;
      setData(_data);
    },
    onClickPlus = () => {
      const _data = cloneDeep(data);
      _data.push({ id: uuidv4(), text: "" });
      setData(_data);
    },
    onClickMinus = (id: string) => {
      const _data = cloneDeep(data).filter((datdItem) => datdItem.id !== id);
      setData(_data);
    };

  useEffect(() => {
    if (init?.title) {
      setTitle(init.title);
    }

    if (init?.data) {
      setData(init.data);
    }
  }, []);

  return (
    <div
      id={id}
      key={key}
      className={`w-[200px] bg-gray-100 rounded-lg p-4 flex flex-col md:ml-auto mt-10 md:mt-0 fixed -translate-y-1/2`}
      style={{
        left: `${coordinate.x}px`,
        top: `${coordinate.y}px`,
      }}
      onClick={onClick}
    >
      <div className="relative mb-4">
        <label className="leading-7 text-sm text-gray-600">Title</label>
        <input
          type="text"
          id="full-name"
          name="full-name"
          className="w-full h-[28px] bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          value={title}
          onChange={onChangeTitle}
        />
      </div>
      <div className="relative mb-4">
        <label className="leading-7 text-sm text-gray-600">Data</label>
        <div
          className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
          onClick={onClickPlus}
        >
          +
        </div>
        {data.map((dataItem, i) => (
          <div className="flex">
            <input
              type="text"
              id="full-name"
              name="full-name"
              className="w-full h-[28px] mb-2 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={dataItem.text}
              onChange={(e) => {
                onChangeData(e, i);
              }}
            />
            <div
              className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={() => {
                onClickMinus(dataItem.id);
              }}
            >
              -
            </div>
          </div>
        ))}
      </div>
      <button
        className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        onClick={() => {
          onConfirm(title, data);
        }}
      >
        Confirm
      </button>
    </div>
  );
}
