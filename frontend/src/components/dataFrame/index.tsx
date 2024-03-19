"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Props, Selections } from "@/types/components/dataFrame";
import { Title, DataItem, Data as DataType } from "@/types/shapes/common";
import cloneDeep from "lodash/cloneDeep";
import Data from "@/shapes/data";

export default function DataFrame({
  shape,
  coordinate,
  feature,
  onConfirm,
  onClick,
}: Props) {
  const [title, setTitle] = useState<Title>(""),
    [selections, setSelections] = useState<Selections>({}),
    [data, setData] = useState<DataType>([]);


  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
  };

  const onClickCheckedBox = (DataText: DataItem["text"]) => {
    const _selections: Selections = cloneDeep(selections);

    _selections[DataText] = !_selections[DataText];

    setSelections(_selections);
  };

  const onClickPlus = () => {
    const _data = cloneDeep(data);
    _data.push({ id: uuidv4(), text: "" });
    setData(_data);
  };

  const onClickMinus = (id: string) => {
    const _data = cloneDeep(data).filter((datdItem) => datdItem.id !== id);
    setData(_data);
  };

  const onChangeData = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const _data = cloneDeep(data);
    _data[i].text = e.currentTarget.value;
    setData(_data);
  };

  const onClickConfirm = () => {
    const selectedData = (() => {
      const data: DataType = [];

      shape.options.forEach((option) => {
        if (selections[option.text]) {
          data.push(option);
        }
      });

      shape.redundancies.forEach((option) => {
        if (selections[option.text]) {
          data.push(option);
        }
      });

      return data;
    })();

    onConfirm(title, data, selectedData);
  };

  useEffect(() => {
    setTitle(shape.title);

    const _selections: Selections = (() => {
      const output: Selections = {};

      shape.options.forEach((option) => {
        output[option.text] = false;
      });

      shape.selectedData.forEach((selectedDataItem) => {
        output[selectedDataItem.text] = true;
      });

      return output;
    })();

    setSelections(_selections);

    if (shape instanceof Data) {
      setData(shape.data)
    }
  }, [shape]);

  return (
    <div
      key={shape.id}
      id={shape.id}
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
      {feature.import &&
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
      }
      {feature.usage &&
        <div className="relative mb-4">
          <div>
            <label className="leading-7 text-sm text-gray-600">Data Usage</label>
          </div>
          <ul className="flex flex-col">
            {shape.options.map((option, i) => (
              <li className="mb-2">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <div className="col-span-1">
                    <span
                      className="bg-indigo-100 text-indigo-500 w-4 h-4 rounded-full inline-flex items-center justify-center"
                      onClick={() => {
                        onClickCheckedBox(option.text);
                      }}
                    >
                      {selections[option.text] && (
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="col-span-1 [overflow-wrap:anywhere]">
                    <span>{option.text}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
      {feature.redundancy &&
        <div className="relative mb-4">
          <div>
            <label className="leading-7 text-sm text-gray-600">Redundancies</label>
          </div>
          <ul className="flex flex-col">
            {shape.redundancies.map((redundancy) => (
              <li className="mb-2">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <div className="col-span-1">
                    <span
                      className="bg-red-100 text-red-500 w-4 h-4 rounded-full inline-flex items-center justify-center"
                      onClick={() => {
                        onClickCheckedBox(redundancy.text);
                      }}
                    >
                      {selections[redundancy.text] && (
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="text-red-500 col-span-1 [overflow-wrap:anywhere]">
                    <span>{redundancy.text}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

        </div>
      }

      <button
        className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        onClick={onClickConfirm}
      >
        Confirm
      </button>
    </div>
  );
}
