import React, { useEffect, useState } from "react";
import Modal from "@/components/modal";
import { getProjects, createProject, deleteProject } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import SquareButton from "@/components/squareButton";
import Icon from "@/components/icon";
import { tailwindColors } from "@/variables/colors";
import styles from "./ProjectModal.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (project: ProjectTypes.Project) => void;
};

const ProjectModal = ({ isOpen, onClose, onSelect }: Props) => {
  const [projects, setProjects] = useState<ProjectTypes.Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      if (res && res.data) setProjects(res.data);
    } catch (e) {
      console.error("Failed to load projects", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const handleCreate = async () => {
    if (!newName) return;
    try {
      await createProject(newName);
      setNewName("");
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = (p: ProjectTypes.Project) => {
    if (onSelect) onSelect(p);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClickX={onClose} width={"600px"}>
      <div className={styles.container} style={{
        ["--border-color" as any]: tailwindColors.grey["5"],
        ["--bg" as any]: tailwindColors.white["500"],
      } as React.CSSProperties}>
        <h3 className={styles.header}>Projects</h3>

        <div className={styles.inputGroup}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New project name"
            className={styles.input}
          />
          <SquareButton
            size={36}
            onClick={handleCreate}
            content={<Icon w={16} h={16} fill={tailwindColors.grey["1"]} />}
            style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
          />
        </div>

        <div className={styles.list}>
          {loading && <div>Loading...</div>}
          {!loading && projects.length === 0 && <div>No projects</div>}
          <ul>
            {projects.map((p) => (
              <li key={p.id} className={styles.listItem}>
                <button className={styles.listButton} onClick={() => handleSelect(p)}>
                  {p.name}
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <SquareButton
                    size={32}
                    style={{ border: `1px solid ${tailwindColors.grey["5"]}` }}
                    onClick={() => handleDelete(p.id)}
                    content={<Icon w={12} h={12} fill={tailwindColors.grey["1"]} />}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.btn}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
