"use client";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEventHandler,
} from "react";
import SidePanel from "@/components/sidePanel";
import CloseButton from "@/components/closeButton";
import { Dialog, Portal } from "@chakra-ui/react";
import Button from "@/components/button";
import Input from "@/components/input";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import IconButton from "@/components/iconButton";
import {
  Check,
  Circle,
  FileText,
  Paperclip,
  Plus,
  Send,
  Trash2,
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

type MessageItem = {
  id: string;
  text: string;
  createdAt: number;
  comment?: string;
};

type TaskItem = {
  id: string;
  title: string;
  completed: boolean;
  owner?: string;
};

type AttachmentItem = {
  id: string;
  file: File;
  previewUrl?: string;
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getMessageTimeLabel = (createdAt?: number) => {
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
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskText, setTaskText] = useState("");
  const [attachmentsByStep, setAttachmentsByStep] = useState<
    Record<string, AttachmentItem[]>
  >({});
  const [previewedAttachment, setPreviewedAttachment] =
    useState<AttachmentItem | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const attachmentPreviewUrlsRef = useRef(new Set<string>());

  useEffect(
    () => () => {
      attachmentPreviewUrlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url)
      );
      attachmentPreviewUrlsRef.current.clear();
    },
    []
  );

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
  const attachments = props.indivisual
    ? attachmentsByStep[props.indivisual.id] || []
    : [];

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
      setMessages([]);
      setTasks([]);
      return;
    }

    try {
      const savedMessages = window.localStorage.getItem(
        `minder-step-activity:${props.indivisual.id}`
      );
      setMessages(savedMessages ? JSON.parse(savedMessages) : []);
      const savedTasks = window.localStorage.getItem(
        `minder-step-tasks:${props.indivisual.id}`
      );
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      setCreator(getStepCreator(props.indivisual.id));
    } catch (error) {
      console.error("Failed to load step messages or tasks:", error);
      setMessages([]);
      setTasks([]);
      setCreator(null);
    }
  }, [props.indivisual?.id]);

  const saveTasks = (nextTasks: TaskItem[]) => {
    if (!props.indivisual) return;
    setTasks(nextTasks);
    try {
      window.localStorage.setItem(
        `minder-step-tasks:${props.indivisual.id}`,
        JSON.stringify(nextTasks)
      );
    } catch (error) {
      console.error("Failed to save step tasks:", error);
    }
  };

  const onSubmitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskText.trim();
    if (!title || !props.indivisual) return;
    saveTasks([
      ...tasks,
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        completed: false,
        owner: selectedAsignee?.value,
      },
    ]);
    setTaskText("");
  };

  const onToggleTask = (taskId: string) => {
    saveTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const onChangeTaskOwner = (taskId: string, owner?: string) => {
    saveTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, owner: owner || undefined } : task
      )
    );
  };

  const onChangeAttachments: ChangeEventHandler<HTMLInputElement> = (event) => {
    const stepId = props.indivisual?.id;
    const files = Array.from(event.currentTarget.files || []);
    if (!stepId || files.length === 0) return;

    const newAttachments = files.map((file): AttachmentItem => {
      if (!file.type.startsWith("image/")) {
        return { id: `${Date.now()}-${Math.random()}`, file };
      }

      const previewUrl = URL.createObjectURL(file);
      attachmentPreviewUrlsRef.current.add(previewUrl);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
      };
    });

    setAttachmentsByStep((current) => ({
      ...current,
      [stepId]: [...(current[stepId] || []), ...newAttachments],
    }));
    event.currentTarget.value = "";
  };

  const onRemoveAttachment = (attachmentId: string) => {
    const stepId = props.indivisual?.id;
    if (!stepId) return;

    if (previewedAttachment?.id === attachmentId) {
      setPreviewedAttachment(null);
    }

    const removedAttachment = (attachmentsByStep[stepId] || []).find(
      (attachment) => attachment.id === attachmentId
    );
    if (removedAttachment?.previewUrl) {
      URL.revokeObjectURL(removedAttachment.previewUrl);
      attachmentPreviewUrlsRef.current.delete(removedAttachment.previewUrl);
    }

    setAttachmentsByStep((current) => ({
      ...current,
      [stepId]: (current[stepId] || []).filter(
        (attachment) => attachment.id !== attachmentId
      ),
    }));
  };

  const saveMessages = (nextMessages: MessageItem[]) => {
    if (!props.indivisual) return;
    setMessages(nextMessages);
    try {
      window.localStorage.setItem(
        `minder-step-activity:${props.indivisual.id}`,
        JSON.stringify(nextMessages)
      );
    } catch (error) {
      console.error("Failed to save step messages:", error);
    }
  };

  const addMessage = (text: string, comment?: string) => {
    saveMessages([
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        createdAt: Date.now(),
        comment,
      },
      ...messages,
    ]);
  };

  const onChangeStatus = (status: CommonTypes.StepStatus) => {
    if (!props.indivisual) return;
    const previousStatus = props.stepStatuses[props.indivisual.id] || "Todo";
    if (previousStatus === status) return;
    props.onChangeStepStatus(props.indivisual.id, status);
    addMessage(`Status changed to ${status}`);
  };

  const onSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = messageText.trim();
    if (!message) return;
    addMessage("You added a message", message);
    setMessageText("");
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
            <CloseButton
              className={styles.closePanelButton}
              ariaLabel="Close step details"
              size="sm"
              onClick={() => props.setIsIndivisualSidePanelOpen(false)}
            />
            <div className={styles.emptyStateTitle}>No step selected</div>
            <div className={styles.emptyStateDescription}>
              Select a step on the canvas to view its details.
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
              <CloseButton
                className={styles.closePanelButton}
                ariaLabel="Close step details"
                size="sm"
                onClick={() => props.setIsIndivisualSidePanelOpen(false)}
              />
            </div>
            <div className={styles.descriptionRow}>
              <div className={styles.descLabel}>Title</div>
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
              <h3>Tasks</h3>
              <span className={styles.countBadge}>{tasks.length}</span>
            </div>
            {tasks.length ? (
              <ul className={styles.taskList}>
                {tasks.map((task) => {
                  const owner = authorOptions.find((option) => option.value === task.owner);

                  return (
                    <li className={styles.taskItem} key={task.id}>
                      <button
                        type="button"
                        className={`${styles.taskCheckbox} ${
                          task.completed ? styles.taskCompleted : ""
                        }`}
                        aria-label={
                          task.completed
                            ? `Mark ${task.title} as incomplete`
                            : `Mark ${task.title} as complete`
                        }
                        aria-pressed={task.completed}
                        onClick={() => onToggleTask(task.id)}
                      >
                        {task.completed && <Check size={11} />}
                      </button>
                      <label className={styles.taskOwnerPicker}>
                        {owner ? (
                          <Avatar
                            src={owner.logo}
                            name={owner.label}
                            size="2xs"
                            className={styles.taskOwnerAvatar}
                          />
                        ) : (
                          <span
                            className={`${styles.unassignedAvatar} ${styles.taskOwnerUnassignedAvatar}`}
                            aria-hidden="true"
                          >
                            <UserRound size={12} />
                          </span>
                        )}
                        <select
                          className={styles.taskOwnerSelect}
                          aria-label={`Assign ${task.title} to a member`}
                          title={owner ? `Owner: ${owner.label}` : "Assign to a member"}
                          value={task.owner || ""}
                          onChange={(event) =>
                            onChangeTaskOwner(task.id, event.target.value)
                          }
                        >
                          <option value="">Unassigned</option>
                          {authorOptions.map((member) => (
                            <option key={member.value} value={member.value}>
                              {member.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span
                        className={`${styles.taskTitle} ${
                          task.completed ? styles.taskTitleCompleted : ""
                        }`}
                      >
                        {task.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.sectionEmpty}>No tasks yet.</p>
            )}
            <form className={styles.taskForm} onSubmit={onSubmitTask}>
              <input
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                placeholder="Add a task..."
                aria-label="Add a task"
              />
              <button
                type="submit"
                aria-label="Add task"
                disabled={!taskText.trim()}
              >
                <Plus size={15} />
              </button>
            </form>
          </section>

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <h3>Attachments</h3>
              <span className={styles.countBadge}>{attachments.length}</span>
              <input
                ref={attachmentInputRef}
                className={styles.attachmentInput}
                type="file"
                multiple
                aria-label="Select attachments"
                onChange={onChangeAttachments}
              />
              <button
                type="button"
                className={styles.attachmentAction}
                aria-label="Add attachments"
                title="Add attachments"
                onClick={() => attachmentInputRef.current?.click()}
              >
                <Paperclip size={14} />
              </button>
            </div>
            {attachments.length ? (
              <ul className={styles.attachmentList}>
                {attachments.map(({ id, file, previewUrl }) => (
                  <li className={styles.attachmentItem} key={id}>
                    {previewUrl ? (
                      <button
                        type="button"
                        className={styles.attachmentPreviewButton}
                        aria-label={`Preview ${file.name}`}
                        onClick={() =>
                          setPreviewedAttachment({ id, file, previewUrl })
                        }
                      >
                        <img
                          className={styles.attachmentPreview}
                          src={previewUrl}
                          alt=""
                        />
                      </button>
                    ) : (
                      <FileText
                        size={14}
                        className={styles.attachmentIcon}
                      />
                    )}
                    <span className={styles.attachmentInfo}>
                      <span className={styles.attachmentName} title={file.name}>
                        {file.name}
                      </span>
                      <span className={styles.attachmentSize}>
                        {formatFileSize(file.size)}
                      </span>
                    </span>
                    <button
                      type="button"
                      className={styles.removeAttachment}
                      aria-label={`Remove ${file.name}`}
                      onClick={() => onRemoveAttachment(id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.sectionEmpty}>No attachments yet.</p>
            )}
          </section>

          <section className={`${styles.detailSection} ${styles.messagesSection}`}>
            <div className={styles.sectionHeading}>
              <h3>Messages</h3>
              <button type="button" className={styles.viewAllButton}>
                View all
              </button>
            </div>
            {messages.length ? (
              <ul className={styles.messageList}>
                {messages.map((item) => (
                  <li className={styles.messageItem} key={item.id}>
                    <span className={styles.messageAvatar}>Y</span>
                    <div className={styles.messageContent}>
                      <span>{item.text}</span>
                      {item.comment && (
                        <span className={styles.messageBody}>
                          {item.comment}
                        </span>
                      )}
                      <time>{getMessageTimeLabel(item.createdAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.sectionEmpty}>No messages yet.</p>
            )}
            <form className={styles.messageForm} onSubmit={onSubmitMessage}>
              <input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write a message..."
                aria-label="Write a message"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!messageText.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </section>

        </div>
        )}
      </SidePanel>
      <Dialog.Root
        open={Boolean(previewedAttachment)}
        onOpenChange={({ open }) => {
          if (!open) setPreviewedAttachment(null);
        }}
        size="cover"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop className={styles.imagePreviewBackdrop} />
          <Dialog.Positioner className={styles.imagePreviewPositioner}>
            <Dialog.Content className={styles.imagePreviewDialog}>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  className={styles.imagePreviewClose}
                  ariaLabel="Close image preview"
                  size="sm"
                  onClick={() => setPreviewedAttachment(null)}
                />
              </Dialog.CloseTrigger>
              <Dialog.Body className={styles.imagePreviewBody}>
                {previewedAttachment?.previewUrl && (
                  <img
                    className={styles.imagePreviewImage}
                    src={previewedAttachment.previewUrl}
                    alt={previewedAttachment.file.name}
                  />
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
