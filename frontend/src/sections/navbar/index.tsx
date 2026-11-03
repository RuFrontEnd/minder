"use client";
import React from "react";
import Icon from "@/components/icon";
import Button from "@/components/button";
import { UserRound } from "lucide-react";
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
  userAvatarUrl?: string;
  userInitials?: string;
  userAvatarColor?: {
    color: string;
    backgroundColor: string;
  };
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

        <div className={styles.collaborators} aria-label="Project members">
          {[
            { name: "John Mason", image: "https://i.pravatar.cc/80?u=iu" },
            { name: "Melissa Jones", image: "https://i.pravatar.cc/80?u=po" },
            { name: "Alex Wang", image: "https://i.pravatar.cc/80?u=alex" },
          ].map((member) => (
            <img
              key={member.name}
              className={styles.collaboratorAvatar}
              src={member.image}
              alt={member.name}
              title={member.name}
            />
          ))}
          <span className={styles.moreMembers} aria-label="2 more members">
            +2
          </span>
        </div>

        <button
          type="button"
          className={styles.accountButton}
          aria-label={props.isAuthorized ? "Open user profile" : "Log in"}
          title={props.isAuthorized ? "User profile" : "Log in"}
          onClick={
            props.isAuthorized
              ? props.onClickUser || props.onClickLogIn
              : props.onClickLogIn
          }
        >
          {props.isAuthorized && props.userAvatarUrl ? (
            <img
              className={styles.accountAvatar}
              src={props.userAvatarUrl}
              alt="Your profile"
            />
          ) : (
            <span
              className={styles.accountAvatarFallback}
              style={{
                color: props.userAvatarColor?.color || "#7b8491",
                backgroundColor:
                  props.userAvatarColor?.backgroundColor || "#e5e7eb",
              }}
            >
              {props.isAuthorized ? props.userInitials || "U" : (
                <UserRound size={17} strokeWidth={2} />
              )}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
