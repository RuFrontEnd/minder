"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Props, Selections } from "@/types/components/dataFrame";
import { Title, DataItem, Data as DataType } from "@/types/shapes/common";
import cloneDeep from "lodash/cloneDeep";
import Data from "@/shapes/data";

export default function Frame(props: any) {

  return (
    <div
      className={`rounded-lg p-4 flex flex-col bg-white-500 shadow-md ${props.className}`}
    >
      {props.children}
    </div>
  );
}
