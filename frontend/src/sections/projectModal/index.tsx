import React, { useEffect, useState } from "react";
import { Input as ChakraInput } from "@chakra-ui/react";
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
  projectName: string;
  onChangeProjectName: (name: string) => void;
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

const ProjectModal = ({
  isOpen,
  onClose,
  projectName,
  onChangeProjectName,
}: Props) => {
  const [projects, setProjects] = useState<ProjectTypes.Project[]>([]);
  const [memberValues, setMemberValues] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(projectName);

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
    if (isOpen) {
      load();
      setNameDraft(projectName);
      setIsEditingName(false);
    }
  }, [isOpen, projectName]);

  const onClickSaveProjectName = () => {
    const name = nameDraft.trim();
    if (!name) return;
    onChangeProjectName(name);
    setNameDraft(name);
    setIsEditingName(false);
  };

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
      className={styles.projectModal}
      bodyClassName={styles.projectModalBody}
      isOpen={isOpen}
      onCancel={onClose}
      placement="center"
      title="Project settings"
      footer={false}
    >
      <p className={styles.subtitle}>Manage your project and its members.</p>

      <div className={styles.nameSection}>
        <h3 className={styles.sectionTitle}>General</h3>
        <div className={styles.nameRow}>
          <span className={styles.nameLabel}>Project name</span>
          {!isEditingName && (
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
              onClick={() => {
                setNameDraft(projectName);
                setIsEditingName(true);
              }}
            />
          )}
        </div>
        {isEditingName ? (
          <>
            <ChakraInput
              autoFocus
              aria-label="Project name"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  onClickSaveProjectName();
                }
              }}
            />
            <div className={styles.nameEditActions}>
              <Button
                variant="outline"
                text="Cancel"
                onClick={() => {
                  setNameDraft(projectName);
                  setIsEditingName(false);
                }}
              />
              <Button text="Save" onClick={onClickSaveProjectName} />
            </div>
          </>
        ) : (
          <div className={styles.nameValue}>
            <span>{projectName || "Untitled Project"}</span>
          </div>
        )}
      </div>

      <div className={styles.memberSection}>
        <div className={styles.memberHeader}>
          <h3 className={styles.sectionTitle}>Members</h3>
          <span className={styles.memberCount}>
            {joinedMembers.length} {joinedMembers.length === 1 ? "member" : "members"}
          </span>
        </div>
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

        <div className={styles.memberList}>
          {joinedMembers.map((member) => (
            <div key={member.value} className={styles.memberListItem}>
              <Avatar src={member.logo} name={member.label} size="sm" />
              <span className={styles.memberRole}>Member</span>
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
              No members have joined this project yet.
            </div>
          )}
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3 className={styles.sectionTitle}>Danger zone</h3>
        <p className={styles.dangerDescription}>
          Deleting this project will permanently remove its stories,
          dependencies and project data.
        </p>
        <div className={styles.actions}>
          <span className={styles.deleteLabel}>Delete this project</span>
          <Button
            variant="outline"
            color={tailwindColors.error["500"]}
            text="Delete Project"
            onClick={onClickDeleteProject}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
