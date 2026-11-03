"use client";
import React, { useEffect, useMemo, useState, ChangeEventHandler } from "react";
import SidePanel from "@/components/sidePanel";
import Button from "@/components/button";
import Input from "@/components/input";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import IconButton from "@/components/iconButton";
import {
  Check,
  Circle,
  Plus,
  Send,
  UserRound,
} from "lucide-react";
import { cloneDeep } from "lodash";
import { tailwindColors } from "@/variables/colors";
import { getStepCreator, type StepCreator } from "@/utils/stepCreator";
import styles from "./index.module.css";

import * as IconTypes from "@/types/components/icon";
import * as SidePanelTypes from "@/types/components/sidePanel";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";
import * as CommonTypes from "@/types/common";

const authorOptions = [
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

type ActivityItem = {
  id: string;
  text: string;
  createdAt: number;
  comment?: string;
};

const getActivityTimeLabel = (createdAt?: number) => {
  if (!createdAt) return "Just now";
  const minutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));
  return minutes === 0 ? "Just now" : `${minutes} minutes ago`;
};

export default function IndivisualSidePanel(
  props: IndivisaulSidePanelTypes.Props
) {
  const [editingTitle, setEditingTitle] = useState<null | string>(null);
  const [editingDescription, setEditingDescription] = useState<null | string>(
    null
  );
  const [asigneeValues, setAsigneeValues] = useState<string[]>([]);
  const [creator, setCreator] = useState<StepCreator | null>(null);
  const [commentText, setCommentText] = useState("");
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  const dependencies = useMemo(
    () =>
      props.indivisual
        ? props.curves
            .filter((curve) => curve.to.shape.id === props.indivisual?.id)
            .map((curve) => curve.from.shape)
        : [],
    [props.curves, props.indivisual?.id]
  );

  const selectedAsignee = authorOptions.find(
    (option) => option.value === (asigneeValues[0] || "")
  );

  const closeEditing = () => {
    props.setIsEditingIndivisual(false);
    setEditingTitle(props.indivisual?.title || null);
    setEditingDescription((props.indivisual as any)?.description || null);
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
    if (!props.indivisual) return;

    setAsigneeValues(
      (props.indivisual as any).asignee
        ? [(props.indivisual as any).asignee]
        : []
    );
  }, [props.indivisual]);

  useEffect(() => {
    if (!props.indivisual) {
      setActivityItems([]);
      return;
    }

    try {
      const savedActivity = window.localStorage.getItem(
        `minder-step-activity:${props.indivisual.id}`
      );
      setActivityItems(savedActivity ? JSON.parse(savedActivity) : []);
      setCreator(getStepCreator(props.indivisual.id));
    } catch (error) {
      console.error("Failed to load step activity:", error);
      setActivityItems([]);
      setCreator(null);
    }
  }, [props.indivisual?.id]);

  const saveActivity = (nextActivity: ActivityItem[]) => {
    if (!props.indivisual) return;
    setActivityItems(nextActivity);
    try {
      window.localStorage.setItem(
        `minder-step-activity:${props.indivisual.id}`,
        JSON.stringify(nextActivity)
      );
    } catch (error) {
      console.error("Failed to save step activity:", error);
    }
  };

  const addActivity = (text: string, comment?: string) => {
    saveActivity([
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        createdAt: Date.now(),
        comment,
      },
      ...activityItems,
    ]);
  };

  const onChangeStatus = (status: CommonTypes.StepStatus) => {
    if (!props.indivisual) return;
    const previousStatus = props.stepStatuses[props.indivisual.id] || "Todo";
    if (previousStatus === status) return;
    props.onChangeStepStatus(props.indivisual.id, status);
    addActivity(`Status changed to ${status}`);
  };

  const onSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const comment = commentText.trim();
    if (!comment) return;
    addActivity("You added a comment", comment);
    setCommentText("");
  };

  return (
    <>
      <SidePanel
        className={styles.root}
        role={"indivisual"}
        size="sm"
        hideHeader
        footer={false}
        open={props.isIndivisualSidePanelOpen}
        placement="end"
        onCancel={() => {
          props.setIsIndivisualSidePanelOpen(false);
        }}
        title=""
        onClickSwitch={onClickSidePanelSwitch}
      >
        {!props.indivisual ? (
          <div className={styles.emptyState}>
            <button
              type="button"
              className={styles.closePanelButton}
              aria-label="Close step details"
              onClick={() => props.setIsIndivisualSidePanelOpen(false)}
            >
              ×
            </button>
            <div className={styles.emptyStateTitle}>No step selected</div>
            <div className={styles.emptyStateDescription}>
              Select a shape on the canvas to view its details.
            </div>
          </div>
        ) : (
        <div className={styles.container}>
          <div className={styles.nameSection}>
            <div className={styles.detailHeaderRow}>
              <span className={styles.detailId}>
                <Circle size={8} fill="currentColor" />
                EP-{String(props.indivisual.epNumber).padStart(3, "0")}
              </span>
              <select
                className={`${styles.statusBadge} ${
                  styles[`status${(props.stepStatuses[props.indivisual.id] || "Todo").replace(" ", "")}`]
                }`}
                aria-label="Step status"
                value={props.stepStatuses[props.indivisual.id] || "Todo"}
                onChange={(event) =>
                  onChangeStatus(event.target.value as CommonTypes.StepStatus)
                }
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              <button
                type="button"
                className={styles.closePanelButton}
                aria-label="Close step details"
                onClick={() => props.setIsIndivisualSidePanelOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.detailTitleRow}>
              {props.isEditingIndivisual ? (
                <Input
                  role="edit_indivisual_title"
                  className={styles.nameInput}
                  value={editingTitle}
                  onChange={onChangeTitle}
                />
              ) : (
                <h2 className={styles.nameValue}>
                  {props.indivisual?.title || "-"}
                </h2>
              )}
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

          <div className={styles.ownerCreatorGrid}>
            <div className={styles.ownerCreatorItem}>
              <div className={styles.fieldLabel}>
                <UserRound size={13} />
                Owner
              </div>
              {selectedAsignee ? (
                <div className={styles.ownerValue}>
                  <Avatar
                    src={selectedAsignee.logo}
                    name={selectedAsignee.label}
                    size="xs"
                  />
                  <span>{selectedAsignee.label}</span>
                </div>
              ) : (
                <div className={styles.ownerValue}>
                  <span className={styles.unassignedAvatar}>
                    <UserRound size={12} />
                  </span>
                  <span>Unassigned</span>
                </div>
              )}
            </div>
            <div className={styles.ownerCreatorItem}>
              <span className={styles.fieldLabel}>
                <UserRound size={13} />
                Creator
              </span>
              <div className={styles.ownerValue}>
                {creator?.avatarUrl ? (
                  <Avatar
                    src={creator.avatarUrl}
                    name={creator.name}
                    size="xs"
                  />
                ) : (
                  <span className={styles.unassignedAvatar}>
                    <UserRound size={12} />
                  </span>
                )}
                <span>{creator?.name || "Unknown"}</span>
              </div>
            </div>
          </div>

          <div className={styles.statusSection}>
            <span className={styles.fieldLabel}>Status</span>
            <div className={styles.statusActionRow}>
              <span
                className={`${styles.statusPill} ${
                  styles[`status${(props.stepStatuses[props.indivisual.id] || "Todo").replace(" ", "")}`]
                }`}
              >
                <Circle size={8} fill="currentColor" />
                {props.stepStatuses[props.indivisual.id] || "Todo"}
              </span>
              <button
                type="button"
                className={styles.markDoneButton}
                onClick={() => onChangeStatus("Done")}
                disabled={
                  (props.stepStatuses[props.indivisual.id] || "Todo") === "Done"
                }
              >
                <Check size={14} />
                Mark as Done
              </button>
            </div>
          </div>

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <h3>Dependencies</h3>
              <span className={styles.countBadge}>{dependencies.length}</span>
              <button
                type="button"
                className={styles.sectionAction}
                aria-label="Add dependency"
                title="Connect dependencies from the canvas"
              >
                <Plus size={16} />
              </button>
            </div>
            {dependencies.length ? (
              <ul className={styles.dependencyList}>
                {dependencies.map((dependency) => {
                  const dependencyStatus =
                    props.stepStatuses[dependency.id] || "Todo";
                  return (
                    <li key={dependency.id}>
                      <button
                        type="button"
                        className={styles.dependencyItem}
                        onClick={() => props.setIndivisual(dependency)}
                      >
                        <Circle
                          size={8}
                          fill="currentColor"
                          className={styles[`status${dependencyStatus.replace(" ", "")}`]}
                        />
                        <span className={styles.dependencyId}>
                          EP-{String(dependency.epNumber).padStart(3, "0")}
                        </span>
                        <span className={styles.dependencyTitle}>
                          {dependency.title}
                        </span>
                        <span
                          className={`${styles.dependencyStatus} ${
                            styles[`status${dependencyStatus.replace(" ", "")}`]
                          }`}
                        >
                          {dependencyStatus}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.sectionEmpty}>No dependencies</p>
            )}
          </section>

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <h3>Followers</h3>
              <span className={styles.countBadge}>3</span>
              <button
                type="button"
                className={styles.sectionAction}
                aria-label="Add follower"
                title="Add follower"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className={styles.followers}>
              {authorOptions.slice(0, 3).map((author) => (
                <span
                  key={author.value}
                  className={styles.followerAvatar}
                  title={author.label}
                >
                  {author.label
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
              ))}
              <button
                type="button"
                className={styles.addFollower}
                aria-label="Add follower"
              >
                <Plus size={14} />
              </button>
            </div>
          </section>

          <section className={`${styles.detailSection} ${styles.activitySection}`}>
            <div className={styles.sectionHeading}>
              <h3>Activity</h3>
              <button type="button" className={styles.viewAllButton}>
                View all
              </button>
            </div>
            {activityItems.length ? (
              <ul className={styles.activityList}>
                {activityItems.map((item) => (
                  <li className={styles.activityItem} key={item.id}>
                    <span className={styles.activityAvatar}>Y</span>
                    <div className={styles.activityContent}>
                      <span>{item.text}</span>
                      {item.comment && (
                        <span className={styles.activityComment}>
                          {item.comment}
                        </span>
                      )}
                      <time>{getActivityTimeLabel(item.createdAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.sectionEmpty}>No activity yet.</p>
            )}
            <form className={styles.commentForm} onSubmit={onSubmitComment}>
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                aria-label="Add a comment"
              />
              <button
                type="submit"
                aria-label="Send comment"
                disabled={!commentText.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </section>

        </div>
        )}
      </SidePanel>
    </>
  );
}
