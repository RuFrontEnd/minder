import React, { useEffect, useState } from "react";
import { ScrollArea } from "@chakra-ui/react";
import Modal from "@/components/modal";
import Button from "@/components/button";
import Combobox from "@/components/combobox";
import Avatar from "@/components/avatar";
import { deleteProject, getProjects } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import * as ComboboxTypes from "@/types/components/combobox";
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

const memberOptions: ComboboxTypes.Item[] = [
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

const ProjectModal = ({ isOpen, onClose, onSelect }: Props) => {
  const [projects, setProjects] = useState<ProjectTypes.Project[]>([]);
  const [memberValues, setMemberValues] = useState<string[]>([]);

  const joinedMembers = memberValues
    .map((value) => memberOptions.find((member) => member.value === value))
    .filter((member): member is ComboboxTypes.Item => !!member);

  const onDeleteMember = (value: string) => {
    setMemberValues((prev) =>
      prev.filter((memberValue) => memberValue !== value)
    );
  };

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

  const onClickDeleteProject = async () => {
    const targetProject = projects[0];
    if (!targetProject) return;

    try {
      await deleteProject(targetProject.id);
      await load();
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onClose}
      placement="center"
      title="Project Info"
      footer={false}
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

      <div className={styles.memberSection}>
        <div className={styles.memberLabel}>member</div>
        <Combobox
          id="project-member-combobox"
          width="100%"
          label=""
          placeholder="Search and add members"
          items={memberOptions}
          value={memberValues}
          onValueChange={(value) => {
            setMemberValues(value);
          }}
          multiple
          closeOnSelect
          showSelectedItems={false}
          emptyText="No members found"
        />

        <ScrollArea.Root className={styles.memberScrollArea}>
          <ScrollArea.Viewport>
            <ScrollArea.Content>
              <div className={styles.memberList}>
                {joinedMembers.map((member) => (
                  <div key={member.value} className={styles.memberListItem}>
                    <Avatar src={member.logo} name={member.label} size="sm" />
                    <IconButton
                      ariaLabel={`Remove ${member.label}`}
                      variant="outline"
                      size="2xs"
                      icon={
                        <Icon
                          type={IconTypes.Type.x}
                          w={10}
                          h={10}
                          stroke={tailwindColors.grey["2"]}
                        />
                      }
                      onClick={() => onDeleteMember(member.value)}
                    />
                  </div>
                ))}
                {!joinedMembers.length && (
                  <div className={styles.memberEmptyText}>
                    No members joined yet
                  </div>
                )}
              </div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar bg="transparent" />
        </ScrollArea.Root>
      </div>

      <div className={styles.actions}>
        <Button
          variant="outline"
          color={tailwindColors.error["500"]}
          text={"Delete Project"}
          onClick={onClickDeleteProject}
        />
      </div>
    </Modal>
  );
};

export default ProjectModal;
