"use client";
import React, { useState, ChangeEventHandler } from "react";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import IconButton from "@/components/iconButton";
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
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const closeEditing = () => {
    props.setIsEditingIndivisual(false);
    // keep external create/add lists untouched here (parent manages them)
    setEditingTitle(props.indivisual?.title || null);
    setEditingDescription((props.indivisual as any)?.description || null);
    setStartDate((props.indivisual as any)?.startDate || "");
    setDueDate((props.indivisual as any)?.dueDate || "");
  };

  const onClickSidePanelSwitch: SidePanelTypes.Props["onClickSwitch"] = (e) => {
    props.setIsIndivisualSidePanelOpen((open) => !open);
  };

  const onClickEditIcon = () => {
    if (!props.indivisual) return false;
    setEditingTitle(props.indivisual?.title);
    setEditingDescription((props.indivisual as any)?.description || null);
    setStartDate((props.indivisual as any)?.startDate || "");
    setDueDate((props.indivisual as any)?.dueDate || "");
    props.setIsEditingIndivisual(true);
  };

  const onClickCancelButton = () => {
    closeEditing();
  };

  const onClickSaveEditingButton = () => {
    if (!props.indivisual) return false;

    if (editingTitle) props.indivisual.title = editingTitle;
    (props.indivisual as any).description = editingDescription || "";
    (props.indivisual as any).startDate = startDate || "";
    (props.indivisual as any).dueDate = dueDate || "";

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

  const onChangeStartDate: ChangeEventHandler<HTMLInputElement> = (e) => {
    setStartDate(e.target.value);
  };

  const onChangeDueDate: ChangeEventHandler<HTMLInputElement> = (e) => {
    setDueDate(e.target.value);
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
                <IconButton
                  role="begin_edit_indivisual"
                  ariaLabel="Begin edit indivisual name"
                  size="2xs"
                  variant="outline"
                  style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
                  icon={
                    <Icon
                      type={IconTypes.Type.pencilSquare}
                      w={12}
                      h={12}
                      stroke={tailwindColors.grey["1"]}
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
                <IconButton
                  role="begin_edit_indivisual_description"
                  ariaLabel="Begin edit indivisual description"
                  size="2xs"
                  variant="outline"
                  style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
                  icon={
                    <Icon
                      type={IconTypes.Type.pencilSquare}
                      w={12}
                      h={12}
                      stroke={tailwindColors.grey["1"]}
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

          <div className={styles.dateSection}>
            <div className={styles.dateRow}>
              <div className={styles.dateLabel}>time line</div>
              {!props.isEditingIndivisual && (
                <IconButton
                  role="begin_edit_indivisual_date"
                  ariaLabel="Begin edit indivisual dates"
                  size="2xs"
                  variant="outline"
                  style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
                  icon={
                    <Icon
                      type={IconTypes.Type.pencilSquare}
                      w={12}
                      h={12}
                      stroke={tailwindColors.grey["1"]}
                    />
                  }
                  onClick={onClickEditIcon}
                />
              )}
            </div>

            {props.isEditingIndivisual ? (
              <div className={styles.dateInputGroup}>
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={onChangeStartDate}
                  className={styles.dateInput}
                />
                <span className={styles.dateTo}>to</span>
                <input
                  type="date"
                  value={dueDate || ""}
                  onChange={onChangeDueDate}
                  className={styles.dateInput}
                />
              </div>
            ) : (
              <div className={styles.dateSummary}>
                <div className={styles.datePair}>
                  <span className={styles.dateLabel}>start date:</span>
                  <span className={styles.dateValueInline}>
                    {(props.indivisual as any)?.startDate || "-"}
                  </span>
                </div>
                <div className={styles.datePair}>
                  <span className={styles.dateLabel}>due date:</span>
                  <span className={styles.dateValueInline}>
                    {(props.indivisual as any)?.dueDate || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidePanel>
    </>
  );
}
