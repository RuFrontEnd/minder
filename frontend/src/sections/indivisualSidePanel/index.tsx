"use client";
import React, { useState, ChangeEventHandler } from "react";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import SquareButton from "@/components/squareButton";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";

import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";

export default function IndivisualSidePanel(
  props: IndivisaulSidePanelTypes.Props
) {
  const [editingTitle, setEditingTitle] = useState<null | string>(null);
  const [editingDescription, setEditingDescription] = useState<null | string>(
    null
  );

  const closeEditing = () => {
    props.setIsEditingIndivisual(false);
    // keep external create/add lists untouched here (parent manages them)
    setEditingTitle(props.indivisual?.title || null);
    setEditingDescription((props.indivisual as any)?.description || null);
  };

  const onClickSidePanelSwitch: SidePanelTypes.Props["onClickSwitch"] = (e) => {
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

  return (
    <>
      <SidePanel
        className={styles.root}
        role={"indivisual"}
        size="sm"
        open={props.isIndivisualSidePanelOpen}
        placement="end"
        onCancel={() => {
          props.setIsIndivisualSidePanelOpen(false);
        }}
        title="Step Info"
        onClickSwitch={onClickSidePanelSwitch}
      >
        <div className={styles.container}>
          <div className={styles.nameSection}>
            <div className={styles.nameRow}>
              <span className={styles.nameLabel}>name</span>
              {!props.isEditingIndivisual && (
                <SquareButton
                  role="begin_edit_indivisual"
                  size={24}
                  style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
                  content={
                    <Icon
                      type={IconTypes.Type.pencilSquare}
                      w={12}
                      h={12}
                      stroke={tailwindColors.grey["1"]}
                      disabled={!props.indivisual}
                      onClick={onClickEditIcon}
                    />
                  }
                  onClick={onClickEditIcon}
                />
              )}
            </div>

            {props.isEditingIndivisual ? (
              <Input
                role="edit_indivisual_title"
                className={styles.nameInput}
                value={editingTitle}
                onChange={onChangeTitle}
              />
            ) : (
              <div className={styles.nameValue}>
                {props.indivisual?.title || "-"}
              </div>
            )}

            {props.isEditingIndivisual && (
              <div className={styles.actions} role="edit_indivisual">
                <Button
                  role="cancel_edit_indivisual"
                  vice
                  text="Cancel"
                  size="sm"
                  onClick={onClickCancelButton}
                />
                <Button
                  role="save_edit_indivisual"
                  text="Save"
                  size="sm"
                  onClick={onClickSaveEditingButton}
                />
              </div>
            )}
          </div>

          <div className={styles.descriptionSection}>
            <div className={styles.descriptionRow}>
              <div className={styles.descLabel}>Description</div>
              {!props.isEditingIndivisual && (
                <SquareButton
                  role="begin_edit_indivisual_description"
                  size={24}
                  style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
                  content={
                    <Icon
                      type={IconTypes.Type.pencilSquare}
                      w={12}
                      h={12}
                      stroke={tailwindColors.grey["1"]}
                      disabled={!props.indivisual}
                      onClick={onClickEditIcon}
                    />
                  }
                  onClick={onClickEditIcon}
                />
              )}
            </div>
            {props.isEditingIndivisual ? (
              <textarea
                role="edit_indivisual_description"
                value={editingDescription || ""}
                onChange={(e) => setEditingDescription(e.target.value)}
                className={styles.textarea}
              />
            ) : (
              <div className={styles.descBox}>
                {(props.indivisual as any)?.description || "-"}
              </div>
            )}
          </div>
        </div>
      </SidePanel>
    </>
  );
}
