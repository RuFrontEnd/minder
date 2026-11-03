"use client";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@chakra-ui/react";
import Modal from "@/components/modal";
import Button from "@/components/button";
import Select from "@/components/select";
import * as authAPIs from "@/apis/auth";
import { createProject, getProjects } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  afterLogout?: (message: string) => void;
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
  const [selectedProject, setSelectedProject] = useState("");
  // const [cardNumber, setCardNumber] = useState("");
  // const [cardHolder, setCardHolder] = useState("");
  // const [expiry, setExpiry] = useState("");
  // const [cvc, setCvc] = useState("");

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

  const onClickAddProject = async () => {
    const projectName = "Untitled Project";
    try {
      await createProject(projectName);
      const updatedProjects = await loadProjects();
      setProjects(updatedProjects);
      setSelectedProject(projectName);
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const userEmail = userProfile?.email;
  const firstName = userProfile?.firstName;
  const lastName = userProfile?.lastName;
  const getProjectLabel = (project: ProjectTypes.Project) =>
    project.name || String(project.id);
  // const storedCardLast4 =
  //   typeof window !== "undefined" ? localStorage.getItem("cardLast4") : null;

  useEffect(() => {
    if (!props.isOpen) return;
    let isActive = true;
    setIsLoadingData(true);
    setLoadError("");
    setUserProfile(null);
    setProjects([]);
    setSelectedProject("");

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
        if (projectsResult.value.length > 0) {
          setSelectedProject(getProjectLabel(projectsResult.value[0]));
        }
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

  return (
    <Modal
      isOpen={props.isOpen}
      title={"User Info"}
      onCancel={props.onClose}
      footer={false}
    >
      <div className={styles.nameSection}>
        <div className={styles.nameRow}>
          <span className={styles.nameLabel}>name</span>
        </div>
        <div className={styles.nameValue}>
          {isLoadingData ? (
            <Skeleton height="20px" width="160px" />
          ) : (
            `${firstName || ""} ${lastName || ""}`.trim() || "Unknown"
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>email</div>
        <div className={styles.nameValue}>
          {isLoadingData ? (
            <Skeleton height="20px" width="200px" />
          ) : (
            userEmail || "-"
          )}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionLabel}>projects</div>
        {isLoadingData ? (
          <Skeleton height="40px" width="100%" borderRadius="6px" />
        ) : (
          <Select
            name="projects"
            placeholder="select project"
            options={projects.map(getProjectLabel)}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          />
        )}
        <div className={styles.nameRow}>
          <div />
          <Button
            variant="ghost"
            size="sm"
            text={"+ New Project"}
            onClick={onClickAddProject}
          />
        </div>
        <div className={styles.list}>
          {isLoadingData ? (
            <div className={styles.projectSkeletons}>
              <Skeleton height="18px" width="70%" />
              <Skeleton height="18px" width="55%" />
            </div>
          ) : projects.length > 0 &&
            projects.map((project) => (
              <div key={project.id} className={styles.nameValue}>
                {getProjectLabel(project)}
              </div>
            ))}
        </div>
        {loadError && (
          <p className={styles.loadError} role="alert">
            {loadError}
          </p>
        )}
      </div>

      {/* <div className={styles.section}>
        <div className={styles.sectionLabel}>credit card</div>
        <Input
          type="text"
          name="Card number"
          placeholder={
            storedCardLast4
              ? `**** **** **** ${storedCardLast4}`
              : "Card number"
          }
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <div className={styles.inputGroup}>
          <Input
            name="Card holder"
            placeholder="Card holder"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
          />
          <Input
            name="MM/YY"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </div>
        <Input
          name="CVC"
          placeholder="CVC"
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
        />
      </div> */}

      <div className={styles.actions}>
        <Button
          variant="outline"
          color={tailwindColors.error["500"]}
          text={"Log Out"}
          loading={isLoggingOut}
          onClick={onLogout}
        />
      </div>
    </Modal>
  );
}
