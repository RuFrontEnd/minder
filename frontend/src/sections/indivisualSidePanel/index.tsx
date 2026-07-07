"use client";
import React, { useEffect, useState, ChangeEventHandler } from "react";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import NumberInput from "@/components/numberInput";
import Combobox from "@/components/combobox";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import IconButton from "@/components/iconButton";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";

import * as ComboboxTypes from "@/types/components/combobox";
import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";

const authorOptions: ComboboxTypes.Item[] = [
  {
    label: "John Mason",
    value: "john-mason",
    logo: "https://i.pravatar.cc/300?u=iu",
  },
  {
    label: "Melissa Jones",
    value: "melissa-jones",
    logo: "https://i.pravatar.cc/300?u=po",
  },
  {
    label: "Alex Wang",
    value: "alex-wang",
    logo: "https://i.pravatar.cc/300?u=alex",
  },
  {
    label: "Cindy Chen",
    value: "cindy-chen",
    logo: "https://i.pravatar.cc/300?u=cindy",
  },
];

export default function IndivisualSidePanel(
  props: IndivisaulSidePanelTypes.Props
) {
  const [editingTitle, setEditingTitle] = useState<null | string>(null);
  const [editingDescription, setEditingDescription] = useState<null | string>(
    null
  );
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [xValue, setXValue] = useState<string>("0");
  const [yValue, setYValue] = useState<string>("0");
  const [wValue, setWValue] = useState<string>("0");
  const [hValue, setHValue] = useState<string>("0");
  const [authorValues, setAuthorValues] = useState<string[]>([]);
  const [asigneeValues, setAsigneeValues] = useState<string[]>([]);

  const selectedAuthor = authorOptions.find(
    (option) => option.value === (authorValues[0] || "")
  );
  const selectedAsignee = authorOptions.find(
    (option) => option.value === (asigneeValues[0] || "")
  );

  const closeEditing = () => {
    props.setIsEditingIndivisual(false);
    // keep external create/add lists untouched here (parent manages them)
    setEditingTitle(props.indivisual?.title || null);
    setEditingDescription((props.indivisual as any)?.description || null);
    setStartDate((props.indivisual as any)?.startDate || "");
    setDueDate((props.indivisual as any)?.dueDate || "");
    setAuthorValues(
      (props.indivisual as any)?.author
        ? [(props.indivisual as any).author]
        : []
    );
    setAsigneeValues(
      (props.indivisual as any)?.asignee
        ? [(props.indivisual as any).asignee]
        : []
    );
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
    setAuthorValues(
      (props.indivisual as any)?.author
        ? [(props.indivisual as any).author]
        : []
    );
    setAsigneeValues(
      (props.indivisual as any)?.asignee
        ? [(props.indivisual as any).asignee]
        : []
    );
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
    (props.indivisual as any).author = authorValues[0] || "";
    (props.indivisual as any).asignee = asigneeValues[0] || "";

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

  const toOneDecimalString = (raw: string | number) => {
    if (raw === "") return "";
    const value = typeof raw === "number" ? raw : Number(raw);
    if (Number.isNaN(value)) return "";
    return value.toFixed(1);
  };

  useEffect(() => {
    if (!props.indivisual) return;

    setXValue(toOneDecimalString(props.indivisual.p.x));
    setYValue(toOneDecimalString(props.indivisual.p.y));
    setWValue(toOneDecimalString(props.indivisual.w));
    setHValue(toOneDecimalString(props.indivisual.h));
  }, [props.indivisual]);

  const applyGeometryChange = (field: "x" | "y" | "w" | "h", raw: string) => {
    if (!props.indivisual) return;

    const value = Math.round(Number(raw) * 10) / 10;
    if (Number.isNaN(value)) return;

    const updatedShapes = cloneDeep(props.shapes);
    const targetShape = updatedShapes.find(
      (shape) => shape.id === props.indivisual?.id
    );
    if (!targetShape) return;

    if (field === "x") {
      targetShape.p = { ...targetShape.p, x: value };
    }
    if (field === "y") {
      targetShape.p = { ...targetShape.p, y: value };
    }
    if (field === "w") {
      targetShape.w = Math.max(1, value);
    }
    if (field === "h") {
      targetShape.h = Math.max(1, value);
    }

    props.updateShapes(updatedShapes);
    props.setIndivisual(cloneDeep(targetShape));
    props.terminateDataChecking();
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
        {!props.indivisual ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No step selected</div>
            <div className={styles.emptyStateDescription}>
              Select a shape on the canvas to view its details.
            </div>
          </div>
        ) : (
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

          <div className={styles.authorSection}>
            <div className={styles.authorRow}>
              <div className={styles.authorLabel}>author</div>
              {!props.isEditingIndivisual && (
                <IconButton
                  role="begin_edit_indivisual_author"
                  ariaLabel="Begin edit indivisual author"
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
              <Combobox
                id="step-author-combobox"
                width="100%"
                label=""
                placeholder="Select author"
                items={authorOptions}
                value={authorValues}
                onValueChange={(value) => {
                  setAuthorValues(value?.length ? [value[0]] : []);
                }}
                multiple={false}
                closeOnSelect
                showSelectedItems={false}
                emptyText="No author found"
              />
            ) : selectedAuthor ? (
              <Avatar
                src={selectedAuthor.logo}
                name={selectedAuthor.label}
                size="sm"
              />
            ) : (
              <div className={styles.authorEmpty}>-</div>
            )}
          </div>

          <div className={styles.authorSection}>
            <div className={styles.authorRow}>
              <div className={styles.authorLabel}>asignee</div>
              {!props.isEditingIndivisual && (
                <IconButton
                  role="begin_edit_indivisual_asignee"
                  ariaLabel="Begin edit indivisual asignee"
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
              <Combobox
                id="step-asignee-combobox"
                width="100%"
                label=""
                placeholder="Select asignee"
                items={authorOptions}
                value={asigneeValues}
                onValueChange={(value) => {
                  setAsigneeValues(value?.length ? [value[0]] : []);
                }}
                multiple={false}
                closeOnSelect
                showSelectedItems={false}
                emptyText="No asignee found"
              />
            ) : selectedAsignee ? (
              <Avatar
                src={selectedAsignee.logo}
                name={selectedAsignee.label}
                size="sm"
              />
            ) : (
              <div className={styles.authorEmpty}>-</div>
            )}
          </div>

          <div className={styles.propertiesSection}>
            <div className={styles.dateLabel}>properties</div>
            <div className={styles.propertiesGrid}>
              <div className={styles.propertyItem}>
                <div className={styles.propertyLabel}>x</div>
                <NumberInput
                  width="100%"
                  step={0.1}
                  value={xValue}
                  onValueChange={(value) => {
                    setXValue(toOneDecimalString(value));
                    applyGeometryChange("x", value);
                  }}
                />
              </div>
              <div className={styles.propertyItem}>
                <div className={styles.propertyLabel}>y</div>
                <NumberInput
                  width="100%"
                  step={0.1}
                  value={yValue}
                  onValueChange={(value) => {
                    setYValue(toOneDecimalString(value));
                    applyGeometryChange("y", value);
                  }}
                />
              </div>
              <div className={styles.propertyItem}>
                <div className={styles.propertyLabel}>w</div>
                <NumberInput
                  width="100%"
                  min={1}
                  step={0.1}
                  value={wValue}
                  onValueChange={(value) => {
                    setWValue(toOneDecimalString(value));
                    applyGeometryChange("w", value);
                  }}
                />
              </div>
              <div className={styles.propertyItem}>
                <div className={styles.propertyLabel}>h</div>
                <NumberInput
                  width="100%"
                  min={1}
                  step={0.1}
                  value={hValue}
                  onValueChange={(value) => {
                    setHValue(toOneDecimalString(value));
                    applyGeometryChange("h", value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        )}
      </SidePanel>
    </>
  );
}
