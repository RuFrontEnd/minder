// TODO: 支援多個 recieve set W 時, 跟隨錯誤 / 更換新增 shape icon / 取消 title 重名檢查 / 終點 terminator 要判斷是否沒有接收到其他 shape(要做錯誤題示) / core shape sendTo 搬遷至 curves sendTo / 雙擊 cp1 || cp2 可自動對位  / 處理 data shape SelectFrame 開關(點擊 frame 以外要關閉) / 尋找左側列 icons / 對齊功能
"use client";

import { cloneDeep } from "lodash";

class A {
  __scale__: number;
  private initScale = 1;
  constructor() {
    this.__scale__ = this.initScale;
  }

  get scale() {
    return this.__scale__;
  }

  set scale(value: number) {
    this.__scale__ = value;
  }

  echo() {
    console.log("this.scale", this.scale);
    console.log("this.__scale__", this.__scale__);
  }
}

let s = 1;

export default function Test() {
  const shapes = [new A()];

  return (
    <>
      <div
        onClick={() => {
          const new_shapes = cloneDeep(shapes);
          new_shapes.forEach((new_shape) => {
            new_shape.scale = 1;
          });

          new_shapes.forEach((new_shape) => {
            new_shape.echo();
          });
        }}
      >
        123
      </div>
      <div
        onClick={() => {
          s += 1;
          shapes.forEach((shape) => {
            shape.scale += 1;
          });
          console.log("shapes", shapes);
        }}
      >
        456
      </div>
    </>
  );
}
