"use client";
import React from "react";
import Button from "@/components/button";
import Icon from "@/components/icon";
import * as IconTypes from "@/types/components/icon";
import { tailwindColors } from "@/variables/colors";

interface NavbarProps {
  isLogIn: boolean;
  isCheckingData: boolean;
  isUpsertingShape: boolean;
  onClickCheck: () => void;
  onClickSave: () => void;
  onClickUpload: () => void;
  onClickDownload: () => void;
  onClickLogIn: () => void;
}

export default function Navbar(props: NavbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full grid grid-cols-3 items-center px-4 py-3 border-b border-grey-5 bg-white-500">
      <div />

      <div className="flex items-center justify-center gap-2">
        <Button
          info
          onClick={props.onClickCheck}
          text={`Check${props.isCheckingData ? "ing" : ""}`}
          loading={props.isCheckingData}
        />

        {props.isLogIn && (
          <Button
            role="upsert_shape_button"
            text="Save"
            onClick={props.onClickSave}
            loading={props.isUpsertingShape}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={props.onClickUpload}
          className="flex items-center gap-1 px-3 py-2 rounded text-grey-2 hover:bg-grey-6 transition-colors duration-150"
          title="Upload project"
        >
          <Icon
            type={IconTypes.Type.upload}
            w={16}
            h={16}
            stroke={tailwindColors.grey["2"]}
          />
          <span className="text-sm font-medium">Upload</span>
        </button>

        <button
          onClick={props.onClickDownload}
          className="flex items-center gap-1 px-3 py-2 rounded text-grey-2 hover:bg-grey-6 transition-colors duration-150"
          title="Download project"
        >
          <Icon
            type={IconTypes.Type.download}
            w={16}
            h={16}
            stroke={tailwindColors.grey["2"]}
          />
          <span className="text-sm font-medium">Download</span>
        </button>

        <div className="w-px h-6 bg-grey-5" />

        <button
          onClick={props.onClickLogIn}
          className={`flex items-center gap-1 px-3 py-2 rounded transition-colors duration-150 ${
            props.isLogIn
              ? "text-grey-2 hover:bg-grey-6"
              : "text-info-500 hover:bg-blue-100"
          }`}
          title={props.isLogIn ? "Log Out" : "Log In"}
        >
          <Icon
            type={IconTypes.Type.user}
            w={16}
            h={16}
            stroke={
              props.isLogIn
                ? tailwindColors.grey["2"]
                : tailwindColors.info["500"]
            }
          />
          <span className="text-sm font-medium">
            {props.isLogIn ? "Log Out" : "Log In"}
          </span>
        </button>
      </div>
    </div>
  );
}
