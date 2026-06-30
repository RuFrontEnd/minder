"use client";
import React from "react";
import Icon from "@/components/icon";
import Button from "@/components/button";
import * as IconTypes from "@/types/components/icon";
import { tailwindColors } from "@/variables/colors";
import styles from "./Navbar.module.css";

interface NavbarProps {
  isAuthorized: boolean;
  isCheckingData: boolean;
  isUpsertingShape: boolean;
  onClickSave: () => void;
  onClickUpload: () => void;
  onClickDownload: () => void;
  onClickLogIn: () => void;
  onClickProjectName: () => void;
  projectName: string;
}

export default function Navbar(props: NavbarProps) {
  const currentProjectName = props.projectName || "Untitled Project";

  return (
    <div
      className={styles.root}
      style={
        {
          ["--border-color" as any]: tailwindColors.grey["5"],
          ["--bg" as any]: tailwindColors.white["500"],
        } as React.CSSProperties
      }
    >
      <div className={styles.leftSpacer} />

      <div className={styles.centerProjectName}>
        <Button
          variant="ghost"
          text={currentProjectName}
          onClick={props.onClickProjectName}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={props.onClickUpload}
          className={styles.actionButton}
          title="Upload project"
        >
          <Icon
            type={IconTypes.Type.upload}
            w={16}
            h={16}
            stroke={tailwindColors.grey["2"]}
          />
          <span className={styles.label}>Upload</span>
        </button>

        <button
          onClick={props.onClickDownload}
          className={styles.actionButton}
          title="Download project"
        >
          <Icon
            type={IconTypes.Type.download}
            w={16}
            h={16}
            stroke={tailwindColors.grey["2"]}
          />
          <span className={styles.label}>Download</span>
        </button>

        <div className={styles.separator} />

        <Button
          variant="ghost"
          color={
            props.isAuthorized
              ? tailwindColors.grey["2"]
              : tailwindColors.info["500"]
          }
          text={
            <>
              <Icon
                type={IconTypes.Type.user}
                w={16}
                h={16}
                stroke={
                  props.isAuthorized
                    ? tailwindColors.grey["2"]
                    : tailwindColors.info["500"]
                }
              />
              {props.isAuthorized ? "Log Out" : <p>Log In</p>}
            </>
          }
          onClick={props.onClickLogIn}
        />
      </div>
    </div>
  );
}
