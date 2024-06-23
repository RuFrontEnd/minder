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
  warning,
}: Props) {
  const [title, setTitle] = useState<Title>(""),
    [selections, setSelections] = useState<Selections>({}),
    [deletions, setDeletions] = useState<Selections>({}),
    [data, setData] = useState<DataType>([]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
  };

  const onClickCheckedBox = (dataText: DataItem["text"]) => {
    const _selections: Selections = cloneDeep(selections);

    if (dataText in deletions && deletions[dataText] === true) {
      const _deletions: Selections = cloneDeep(deletions);
      _deletions[dataText] = false;
      setDeletions(_deletions);
    }

    _selections[dataText] = !_selections[dataText];

    setSelections(_selections);
  };

  const onClickDeletionCheckedBox = (dataText: DataItem["text"]) => {
    const _deletions: Selections = cloneDeep(deletions);

    if (dataText in selections && selections[dataText] === true) {
      const _selections: Selections = cloneDeep(selections);
      _selections[dataText] = false;
      setSelections(_selections);
    }

    _deletions[dataText] = !_deletions[dataText];

    setDeletions(_deletions);
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

    const deletedData = (() => {
      const data: DataType = [];

      shape.options.forEach((option) => {
        if (deletions[option.text]) {
          data.push(option);
        }
      });

      shape.redundancies.forEach((option) => {
        if (deletions[option.text]) {
          data.push(option);
        }
      });

      return data;
    })();

    onConfirm(title, data, selectedData, deletedData);
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

    const _deletions: Selections = (() => {
      const output: Selections = {};

      shape.options.forEach((option) => {
        output[option.text] = false;
      });

      shape.deletedData.forEach((deletedData) => {
        output[deletedData.text] = true;
      });

      return output;
    })();

    setDeletions(_deletions);

    if (shape instanceof Data) {
      setData(shape.data);
    }
  }, [shape]);

  return (
    <div
      key={shape.id}
      id={shape.id}
      className={`w-[200px] rounded-lg p-4 flex flex-col md:ml-auto mt-10 md:mt-0 fixed -translate-y-1/2 bg-white-500 shadow-md`}
      style={{
        left: `${coordinate.x}px`,
        top: `${coordinate.y}px`,
      }}
      onClick={onClick}
    >
      <div className="relative mb-4">
        <label className="leading-7 text-sm text-gray-600">
          <span className="mr-1">Title</span>
          {warning?.title && (
            <span className="text-red-500">{warning?.title}</span>
          )}
        </label>
        <input
          type="text"
          id="full-name"
          name="full-name"
          className={`w-full h-[28px] bg-white rounded border ${!!warning?.title ? "border-red-500" : "border-gray-300"
            } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
          value={title}
          onChange={onChangeTitle}
        />
      </div>
      {feature.import && (
        <div className="relative mb-4">
          <label className="leading-7 text-sm text-gray-600">Data</label>
          <div
            className="w-6 h-6 ml-2 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
            onClick={onClickPlus}
          >
            +
          </div>
          {data.map((dataItem, i) => (
            <div className="flex flex-col">
              {warning && warning.data[i] && (
                <span className="text-red-500">{warning.data[i]}</span>
              )}
              <div className="flex">
                <input
                  type="text"
                  id="full-name"
                  name="full-name"
                  className={`w-full h-[28px] mb-2 bg-white rounded border 
                  ${warning && warning.data[i]
                      ? "border-red-500"
                      : "border-gray-300"
                    }
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
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
            </div>
          ))}
        </div>
      )}
      {feature.usage && (
        <div className="relative mb-4">
          <div>
            <label className="leading-7 text-sm text-gray-600">
              Data Usage
            </label>
          </div>
          <ul className="flex flex-col">
            {shape.options.map((option, i) => (
              <li className="mb-2">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <div className="col-span-1 flex items-center">
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
                    <span
                      className="bg-indigo-100 text-indigo-500 w-4 h-4 rounded-full inline-flex items-center justify-center ml-1"
                      onClick={() => {
                        onClickDeletionCheckedBox(option.text);
                      }}
                    >
                      {deletions[option.text] && (
                        <svg
                          className="w-3 h-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="4"
                            d="M6 18 17.94 6M18 18 6.06 6"
                          />
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
      )}
      {feature.redundancy && (
        <div className="relative mb-4">
          <div>
            <label className="leading-7 text-sm text-gray-600">
              Redundancies
            </label>
          </div>
          <ul className="flex flex-col">
            {shape.redundancies.map((redundancy) => (
              <li className="mb-2">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <div className="col-span-1 flex items-center">
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
                    <span
                      className="bg-red-100 text-red-500 w-4 h-4 rounded-full inline-flex items-center justify-center ml-1"
                      onClick={() => {
                        onClickDeletionCheckedBox(redundancy.text);
                      }}
                    >
                      {deletions[redundancy.text] && (
                        <svg
                          className="w-3 h-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="4"
                            d="M6 18 17.94 6M18 18 6.06 6"
                          />
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
      )}

      <button
        className="text-white-500 bg-primary-500 border-0 py-2 px-8 focus:outline-none rounded text-lg"
        onClick={onClickConfirm}
      >
        Confirm
      </button>
    </div>
  );
}
