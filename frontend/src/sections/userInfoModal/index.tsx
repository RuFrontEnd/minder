"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/components/modal";
import Button from "@/components/button";
import Input from "@/components/input";
import Icon from "@/components/icon";
import * as IconTypes from "@/types/components/icon";
import * as authAPIs from "@/apis/auth";
import { getProjects } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  afterLogout?: () => void;
};

export default function UserInfoModal(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectTypes.Project[]>([]);
  // const [cardNumber, setCardNumber] = useState("");
  // const [cardHolder, setCardHolder] = useState("");
  // const [expiry, setExpiry] = useState("");
  // const [cvc, setCvc] = useState("");

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      if (res && res.data) setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const onLogout = async () => {
    setIsLoading(true);
    try {
      await authAPIs.logout();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem("Authorization");
    setIsLoading(false);
    props.afterLogout && props.afterLogout();
    props.onClose();
  };

  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const firstName =
    typeof window !== "undefined"
      ? localStorage.getItem("userFirstName")
      : null;
  const lastName =
    typeof window !== "undefined" ? localStorage.getItem("userLastName") : null;
  // const storedCardLast4 =
  //   typeof window !== "undefined" ? localStorage.getItem("cardLast4") : null;

  useEffect(() => {
    if (!props.isOpen) return;
    loadProjects();
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
          {`${firstName || ""} ${lastName || ""}`.trim() || "Unknown"}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>email</div>
        <div className={styles.nameValue}>{userEmail || "-"}</div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionLabel}>projects</div>
        <div className={styles.list}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className={styles.nameValue}>
                {project.name}
              </div>
            ))
          ) : (
            <div className={styles.memberEmptyText}>No projects</div>
          )}
        </div>
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
          onClick={onLogout}
        />
      </div>
    </Modal>
  );
}
