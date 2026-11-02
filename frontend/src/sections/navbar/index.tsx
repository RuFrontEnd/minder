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
  onClickUser?: () => void;
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
      <button
        className={styles.brand}
        type="button"
        aria-label="Minder home"
      >
        <svg
          className={styles.brandMark}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M16 3 30 27H2L16 3Z" fill="#2878f0" />
          <path d="m16 13 8 14H8l8-14Z" fill="#fff" />
          <path d="m16 13 8 14h-8V13Z" fill="#7fb5ff" />
        </svg>
        <span>Minder</span>
      </button>

      <div className={styles.centerProjectName}>
        <Button
          variant="ghost"
          text={currentProjectName}
          onClick={props.onClickProjectName}
        />
      </div>

      <div className={styles.actions}>
        {/* <button
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
        </button> */}

        {/* <div className={styles.separator} /> */}

        {props.isAuthorized ? (
          <Button
            variant="ghost"
            color={tailwindColors.info["500"]}
            text={
              <>
                <Icon
                  type={IconTypes.Type.user}
                  w={16}
                  h={16}
                  stroke={tailwindColors.info["500"]}
                />
                User
              </>
            }
            onClick={props.onClickUser || props.onClickLogIn}
          />
        ) : (
          <Button
            variant="ghost"
            color={tailwindColors.info["500"]}
            text={
              <>
                <Icon
                  type={IconTypes.Type.user}
                  w={16}
                  h={16}
                  stroke={tailwindColors.info["500"]}
                />
                Log In
              </>
            }
            onClick={props.onClickLogIn}
          />
        )}
      </div>
    </div>
  );
}
