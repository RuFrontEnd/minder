import React, { useEffect, useState } from "react";
import Modal from "@/components/modal";
import { getProjects } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import * as IconTypes from "@/types/components/icon";
import IconButton from "@/components/iconButton";
import Icon from "@/components/icon";
import { tailwindColors } from "@/variables/colors";
import styles from "./index.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (project: ProjectTypes.Project) => void;
};

const ProjectModal = ({ isOpen, onClose, onSelect }: Props) => {
  const [projects, setProjects] = useState<ProjectTypes.Project[]>([]);

  const load = async () => {
    try {
      const res = await getProjects();
      if (res && res.data) setProjects(res.data);
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onClose}
      placement="center"
      title="Project Info"
    >
      <div className={styles.nameSection}>
        <div className={styles.nameRow}>
          <span className={styles.nameLabel}>name</span>
          <IconButton
            ariaLabel="Edit project name"
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
            onClick={() => {}}
          />
        </div>
        <div className={styles.nameValue}>
          {projects[0]?.name ?? "test project"}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
