"use client";
import React, { useState, ChangeEventHandler, useEffect } from "react";
import AuthModal from "@/blocks/indivisualSidePanel/authModal";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Decision from "@/shapes/decision";
import Curve from "@/shapes/curve";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import * as authAPIs from "@/apis/auth";
import * as handleUtils from "@/utils/handle";

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
  const [editingDescription, setEditingDescription] = useState<null | string>(
    null
  );
  const [isAuthModalOpen, setIsAccountModalOpen] = useState(false);

  const closeEditing = () => {
    props.setIsEditingIndivisual(false);
    // keep external create/add lists untouched here (parent manages them)
    setEditingTitle(props.indivisual?.title || null);
    setEditingDescription((props.indivisual as any)?.description || null);
  };

  const onClickSidePanelSwitch: SidePanelTypes.Props["onClickSwitch"] = (e) => {
    e.preventDefault();
    props.setIsIndivisualSidePanelOpen((open) => !open);
  };

  const onClickEditIcon = () => {
    if (!props.indivisual) return false;
    setEditingTitle(props.indivisual?.title);
    setEditingDescription((props.indivisual as any)?.description || null);
    props.setIsEditingIndivisual(true);
  };

  const onClickCancelButton = () => {
    closeEditing();
  };

  const onClickSaveEditingButton = () => {
    if (!props.indivisual) return false;

    if (editingTitle) props.indivisual.title = editingTitle;
    (props.indivisual as any).description = editingDescription || "";

    const _indivisual = cloneDeep(props.indivisual);
    props.setIndivisual(_indivisual);
    props.draw();
    closeEditing();
    props.terminateDataChecking();
    return false;
  };

  const onChangeTitle: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEditingTitle(e.target.value);
  };
  
  useEffect(() => {
    if (props.authModalOpenSignal < 1) return;
    setIsAccountModalOpen(true);
  }, [props.authModalOpenSignal]);

  const onClickAuthModalX = () => {
    setIsAccountModalOpen(false);
  };

  const afterLogin = () => {
    setIsAccountModalOpen(false);
    props.setIsLogin(true);
  };

  const afterLogout = () => {
    props.setIsLogin(false);
  };



  return (
    <>
      <SidePanel
        className="z-[60]"
        role={"indivisual"}
        open={props.isIndivisualSidePanelOpen}
        horizentalD={SidePanelTypes.HorizentalD.r}
        verticalD={SidePanelTypes.VerticalD.b}
        w={"360px"}
        h={"calc(-65px + 100vh)"}
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
            <div className="flex-1 flex flex-col">
              <div className="mb-2 text-sm text-grey-2 ms-1">Description</div>
              {props.isEditingIndivisual ? (
                <textarea
                  role="edit_indivisual_description"
                  value={editingDescription || ""}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="resize-none p-2 rounded border border-grey-4 h-full"
                />
              ) : (
                <div className="p-2 text-sm text-grey-2 overflow-auto h-full">
                  {(props.indivisual as any)?.description || "-"}
                </div>
              )}
            </div>
          </div>
        </div>
        <AuthModal
          isLogIn={props.isLogIn}
          isOpen={isAuthModalOpen}
          onClickX={onClickAuthModalX}
          afterLogin={afterLogin}
          afterLogout={afterLogout}
        />
      </SidePanel>
    </>
  );
}
