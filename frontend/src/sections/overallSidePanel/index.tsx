"use client";
import React, { useMemo, useState } from "react";
import SidePanel from "@/components/sidePanel";
import CloseButton from "@/components/closeButton";
import { Menu } from "@/components/menu";
import Portal from "@/components/portal";
import { ChevronDown, Circle, Search, UserRound } from "lucide-react";
import styles from "./index.module.css";
import * as CommonTypes from "@/types/common";
import * as OverallSidePanelTypes from "@/types/sections/id/overallSidePanel";

type StatusFilter = "All Statuses" | CommonTypes.StepStatus;

export default function OverallSidePanel(props: OverallSidePanelTypes.Props) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Statuses");

  const onClickOverallSidePanelSwitch = () => {
    props.setIsOverAllSidePanelOpen((open) => !open);
  };

  const onClickPositioningButton = (shapeP: CommonTypes.Vec) => {
    props.positioning(shapeP);
  };

  const onClickStepRow = (shapeId: string, shapeP: CommonTypes.Vec) => {
    onClickPositioningButton(shapeP);
    props.onSelectStep?.(shapeId);
  };

  const visibleSteps = useMemo(
    () =>
      props.steps.filter((step) => {
        const matchesSearch = step.title
          .toLowerCase()
          .includes(searchText.trim().toLowerCase());
        const matchesStatus =
          statusFilter === "All Statuses" ||
          (props.stepStatuses[step.id] || "Todo") === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [props.steps, props.stepStatuses, searchText, statusFilter]
  );

  const completedCount = props.steps.filter(
    (step) => (props.stepStatuses[step.id] || "Todo") === "Done"
  ).length;

  return (
    <SidePanel
      className={styles.root}
      hideHeader
      open={props.isOverAllSidePanelOpen}
      placement="start"
      size="xs"
      footer={false}
      onClickSwitch={onClickOverallSidePanelSwitch}
      onCancel={() => {
        props.setIsOverAllSidePanelOpen(false);
      }}
      onInteractOutside={() => {
        props.setIsOverAllSidePanelOpen(false);
      }}
    >

      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Steps</h2>
        <CloseButton
          className={styles.closePanelButton}
          ariaLabel="Close steps panel"
          size="sm"
          onClick={() => props.setIsOverAllSidePanelOpen(false)}
        />
      </div>
      <div className={styles.storiesPanel}>
        <label className={styles.searchBox}>
          <Search size={14} />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search stories..."
            aria-label="Search stories"
          />
        </label>

        <div className={styles.filters}>
          <Menu.Root positioning={{ placement: "bottom-start" }}>
            <Menu.Trigger asChild>
              <button
                type="button"
                className={`${styles.filterSelect} ${styles.statusFilterTrigger}`}
                aria-label="Filter by status"
              >
                <span>{statusFilter}</span>
                <ChevronDown size={12} />
              </button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content className={styles.statusMenuContent}>
                  {(
                    [
                      "All Statuses",
                      "Done",
                      "In Progress",
                      "Todo",
                    ] as StatusFilter[]
                  ).map((status) => (
                    <Menu.Item
                      key={status}
                      value={status}
                      className={styles.statusMenuItem}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          <span className={`${styles.filterSelect} ${styles.memberFilter}`}>
            <UserRound size={12} />
            <span>All Members</span>
            <ChevronDown size={12} />
          </span>
        </div>

        <section className={styles.projectSummary}>
          <h2>{props.projectName.val || "Untitled Project"}</h2>
          <div className={styles.progressLabel}>
            <span>
              {completedCount} / {props.steps.length} completed
            </span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={props.steps.length}
          >
            <span
              style={{
                width: props.steps.length
                  ? `${(completedCount / props.steps.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </section>

        <ul className={styles.list}>
          {visibleSteps.map((step) => {
            const stepStatus = props.stepStatuses[step.id] || "Todo";
            return (
              <li key={step.id}>
                <button
                  type="button"
                  className={`${styles.stepRow} ${
                    props.selectedShapeId === step.id ? styles.selectedRow : ""
                  }`}
                  onClick={() => onClickStepRow(step.id, step.p)}
                >
                  <Circle
                    size={8}
                    className={`${styles.statusDot} ${
                      styles[`status${stepStatus.replace(" ", "")}`]
                    }`}
                    fill="currentColor"
                  />
                  <span className={styles.stepId}>
                    EP-{String(step.epNumber).padStart(3, "0")}
                  </span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </button>
                <div className={styles.stepMeta}>
                  <span className={styles.assignee}>
                    <UserRound size={13} />
                    Unassigned
                  </span>
                  <Menu.Root positioning={{ placement: "bottom-end" }}>
                    <Menu.Trigger asChild>
                      <button
                        type="button"
                        className={`${styles.statusSelect} ${
                          styles[`statusBadge${stepStatus.replace(" ", "")}`]
                        }`}
                        aria-label={`Status for ${step.title}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {stepStatus}
                        <ChevronDown size={11} />
                      </button>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content className={styles.statusMenuContent}>
                          {(
                            [
                              "Todo",
                              "In Progress",
                              "Done",
                            ] as CommonTypes.StepStatus[]
                          ).map((status) => (
                            <Menu.Item
                              key={status}
                              value={status}
                              className={styles.statusMenuItem}
                              onClick={() =>
                                props.onChangeStepStatus(step.id, status)
                              }
                            >
                              {status}
                            </Menu.Item>
                          ))}
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                </div>
              </li>
            );
          })}
          {visibleSteps.length === 0 && (
            <li className={styles.emptyState}>No steps match your filters.</li>
          )}
        </ul>
      </div>
    </SidePanel>
  );
}
