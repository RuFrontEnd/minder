"use client";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@chakra-ui/react";
import Modal from "@/components/modal";
import Button from "@/components/button";
import * as authAPIs from "@/apis/auth";
import { createProject, getProjects } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isCloseDisabled?: boolean;
  afterLogout?: (message: string) => void;
  afterCreateProject?: (project: ProjectTypes.Project) => void;
  onSelectProject?: (project: ProjectTypes.Project) => void;
};

export default function UserInfoModal(props: Props) {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [userProfile, setUserProfile] = useState<{
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [projects, setProjects] = useState<ProjectTypes.Project[]>([]);

  const loadProjects = async () => {
    const res = await getProjects();
    return res.data as ProjectTypes.Project[];
  };

  const onLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await authAPIs.logout();
      localStorage.removeItem("Authorization");
      props.afterLogout?.(res.data.message);
      props.onClose();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onClickProject = (project: ProjectTypes.Project) => {
    props.onSelectProject?.(project);
    if (!props.isCloseDisabled) props.onClose();
  };

  const onClickAddProject = async () => {
    try {
      const res = await createProject("Untitled Project");
      props.afterCreateProject?.(res.data as ProjectTypes.Project);
      if (!props.isCloseDisabled) props.onClose();
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const userEmail = userProfile?.email;
  const firstName = userProfile?.firstName;
  const lastName = userProfile?.lastName;
  const getProjectLabel = (project: ProjectTypes.Project) =>
    project.name || String(project.id);

  useEffect(() => {
    if (!props.isOpen) return;
    let isActive = true;
    setIsLoadingData(true);
    setLoadError("");
    setUserProfile(null);
    setProjects([]);

    const loadModalData = async () => {
      const [userResult, projectsResult] = await Promise.allSettled([
        authAPIs.getCurrentUser(),
        loadProjects(),
      ]);

      if (!isActive) return;

      const errors: unknown[] = [];
      if (userResult.status === "fulfilled") {
        setUserProfile(userResult.value.data);
      } else {
        errors.push(userResult.reason);
      }

      if (projectsResult.status === "fulfilled") {
        setProjects(projectsResult.value);
      } else {
        errors.push(projectsResult.reason);
      }

      if (errors.length) {
        errors.forEach((error) =>
          console.error("Failed to load user info modal data:", error)
        );
        setLoadError("Unable to load some account details. Please try again.");
      }

      setIsLoadingData(false);
    };

    void loadModalData();

    return () => {
      isActive = false;
    };
  }, [props.isOpen]);

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return (
    <Modal
      className={styles.userInfoModal}
      bodyClassName={styles.userInfoModalBody}
      isOpen={props.isOpen}
      onCancel={props.isCloseDisabled ? undefined : props.onClose}
      placement="center"
      title="Account settings"
      footer={false}
    >
      <p className={styles.subtitle}>Manage your account and projects.</p>

      <div className={styles.nameSection}>
        <h3 className={styles.sectionTitle}>General</h3>
        <div className={styles.nameRow}>
          <span className={styles.nameLabel}>Name</span>
        </div>
        <div className={styles.nameValue}>
          {isLoadingData ? (
            <Skeleton height="20px" width="160px" />
          ) : (
            <span>{fullName || "Unknown"}</span>
          )}
        </div>
        <div className={styles.nameRow}>
          <span className={styles.nameLabel}>Email</span>
        </div>
        <div className={styles.nameValue}>
          {isLoadingData ? (
            <Skeleton height="20px" width="200px" />
          ) : (
            <span>{userEmail || "-"}</span>
          )}
        </div>
        {loadError && (
          <p className={styles.loadError} role="alert">
            {loadError}
          </p>
        )}
      </div>

      <div className={styles.projectSection}>
        <div className={styles.projectHeader}>
          <h3 className={styles.sectionTitle}>Projects</h3>
          <span className={styles.projectCount}>
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <div className={styles.projectList}>
          {isLoadingData ? (
            <div className={styles.projectSkeletons}>
              <Skeleton height="24px" width="70%" />
              <Skeleton height="24px" width="55%" />
            </div>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <button
                type="button"
                key={project.id}
                className={styles.projectListItem}
                onClick={() => onClickProject(project)}
              >
                <span className={styles.projectName}>
                  {getProjectLabel(project)}
                </span>
                <span className={styles.projectRole}>Owner</span>
              </button>
            ))
          ) : (
            <div className={styles.projectEmptyText}>
              You don&apos;t have any projects yet.
            </div>
          )}
        </div>

        <div className={styles.projectActions}>
          <Button
            variant="outline"
            text="+ New Project"
            onClick={onClickAddProject}
          />
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3 className={styles.sectionTitle}>Sign out</h3>
        <p className={styles.dangerDescription}>
          You will need to log in again to access your projects.
        </p>
        <div className={styles.actions}>
          <span className={styles.actionLabel}>Sign out of your account</span>
          <Button
            variant="outline"
            color={tailwindColors.error["500"]}
            text="Log Out"
            loading={isLoggingOut}
            onClick={onLogout}
          />
        </div>
      </div>
    </Modal>
  );
}
