import React, { useEffect, useState } from "react";
import { Input as ChakraInput, Skeleton } from "@chakra-ui/react";
import Modal from "@/components/modal";
import Button from "@/components/button";
import Combobox from "@/components/combobox";
import Avatar from "@/components/avatar";
import {
  addProjectMember,
  deleteProject,
  getProjectMembers,
  removeProjectMember,
} from "@/apis/project";
import { searchUsers, UserSearchResult } from "@/apis/user";
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
  isAuthorized: boolean;
  isOwner: boolean;
  projectId: string | null;
  onDeleted?: () => void;
  onSelect?: (project: ProjectTypes.Project) => void;
  projectName: string;
  onChangeProjectName: (name: string) => void | Promise<void>;
};

const ProjectModal = ({
  isOpen,
  onClose,
  isAuthorized,
  isOwner,
  projectId,
  onDeleted,
  projectName,
  onChangeProjectName,
}: Props) => {
  const [memberValues, setMemberValues] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(projectName);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteName, setDeleteName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberOptions, setMemberOptions] = useState<ComboboxTypes.Item[]>(
    []
  );
  const [memberUsers, setMemberUsers] = useState<
    Record<string, UserSearchResult>
  >({});
  const [memberError, setMemberError] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(
    null
  );

  const joinedMembers = memberValues
  .map((value) => memberUsers[value])
  .filter((member): member is UserSearchResult => !!member);

  const onSearchMembers = async (query: string) => {
    if (!isAuthorized || query.trim().length === 0) {
      setMemberOptions([]);
      return;
    }

    try {
      const response = await searchUsers(query.trim());
      const users = response.data.filter(
        (user) => !memberValues.includes(user.id)
      );
      setMemberUsers((current) => ({
        ...current,
        ...Object.fromEntries(users.map((user) => [user.id, user])),
      }));
      setMemberOptions(
        users.map((user) => ({
          label: `${user.firstName} ${user.lastName} (${user.email})`,
          value: user.id,
          logo: user.avatarUrl || undefined,
        }))
      );
    } catch (error) {
      console.error("Failed to search users", error);
      setMemberError("Unable to search users.");
    }
  };

  const onChangeMemberValues = async (values: string[]) => {
    const addedUserId = values.find((value) => !memberValues.includes(value));
    if (!addedUserId || !projectId) return;

    setMemberError("");
    try {
      await addProjectMember(projectId, addedUserId);
      setMemberValues((current) => [...current, addedUserId]);
    } catch (error) {
      console.error("Failed to add project member", error);
      setMemberError("Unable to add this user to the project.");
    }
  };

  const onRemoveMember = async (userId: string) => {
    if (!projectId || removingMemberId) return;

    setRemovingMemberId(userId);
    setMemberError("");
    try {
      await removeProjectMember(projectId, userId);
      setMemberValues((current) =>
        current.filter((memberId) => memberId !== userId)
      );
      setMemberUsers((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
    } catch (error) {
      console.error("Failed to remove project member", error);
      setMemberError("Unable to remove this user from the project.");
    } finally {
      setRemovingMemberId(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setNameDraft(projectName);
      setIsEditingName(false);
      setMemberError("");
      setMemberOptions([]);
      setMemberValues([]);
      setMemberUsers({});

      if (isAuthorized && projectId) {
        let isActive = true;
        setIsLoadingMembers(true);
        void getProjectMembers(projectId)
          .then((response) => {
            if (!isActive) return;
            const members = response.data as Array<{
              userId: string;
              email: string;
              firstName: string;
              lastName: string;
              avatarUrl?: string | null;
              avatarColor?: string | null;
              avatarBackgroundColor?: string | null;
              role: string;
            }>;
            const users = Object.fromEntries(
              members.map((member) => [
                member.userId,
                {
                  id: member.userId,
                  email: member.email,
                  firstName: member.firstName,
                  lastName: member.lastName,
                  avatarUrl: member.avatarUrl,
                  avatarColor: member.avatarColor
                    ? {
                        name: member.role,
                        color: member.avatarColor,
                        backgroundColor:
                          member.avatarBackgroundColor || "#e5e7eb",
                      }
                    : null,
                  role: member.role,
                },
              ])
            );
            setMemberUsers(users);
            setMemberValues(members.map((member) => member.userId));
          })
          .catch((error) => {
            if (!isActive) return;
            console.error("Failed to load project members", error);
            setMemberError("Unable to load project members.");
          })
          .finally(() => {
            if (isActive) setIsLoadingMembers(false);
          });

        return () => {
          isActive = false;
        };
      }
      setIsLoadingMembers(false);
    }
  }, [isOpen, projectName, isAuthorized, projectId]);

  const onClickSaveProjectName = async () => {
    const name = nameDraft.trim();
    if (!name) return;
    try {
      await onChangeProjectName(name);
      setNameDraft(name);
      setIsEditingName(false);
    } catch (e) {
      console.error("Failed to update project name", e);
    }
  };

  const onClickDeleteProject = () => {
    setDeleteName("");
    setDeleteError("");
    setIsDeleteConfirmOpen(true);
  };

  const onConfirmDeleteProject = async () => {
    if (deleteName.trim() !== projectName.trim()) {
      setDeleteError("The project name does not match.");
      return;
    }
    if (!projectId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      setIsDeleteConfirmOpen(false);
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete project", error);
      setDeleteError("Unable to delete this project. Please try again.");
    } finally {
      setIsDeleting(false);
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
        <div className={styles.projectIdValue}>
          <span className={styles.projectIdLabel}>Project ID</span>
          <code>{projectId || "Not saved"}</code>
        </div>
      </div>

      <div
        className={styles.memberSection}
        aria-disabled={!isAuthorized}
      >
        <div className={styles.memberHeader}>
          <h3 className={styles.sectionTitle}>Members</h3>
          <span className={styles.memberCount}>
            {isLoadingMembers ? "Loading..." : `${joinedMembers.length} ${
              joinedMembers.length === 1 ? "member" : "members"
            }`}
          </span>
        </div>
        <Combobox
          id="project-member-combobox"
          width="100%"
          label=""
          placeholder="Search and add members"
          items={memberOptions}
          value={memberValues}
          onInputValueChange={onSearchMembers}
          onValueChange={onChangeMemberValues}
          multiple
          closeOnSelect
          showSelectedItems={false}
          emptyText="No members found"
        />
        {memberError && <p className={styles.memberError}>{memberError}</p>}

        <div className={styles.memberList}>
          {isLoadingMembers ? (
            <div className={styles.memberSkeletonList}>
              <Skeleton height="48px" />
              <Skeleton height="48px" />
            </div>
          ) : joinedMembers.length ? joinedMembers.map((member) => (
            <div key={member.id} className={styles.memberListItem}>
              <Avatar
                src={member.avatarUrl || undefined}
                name={`${member.firstName} ${member.lastName}`}
                fallback={
                  <span
                    className={styles.memberAvatarFallback}
                    style={{
                      color: member.avatarColor?.color || "#6b7280",
                      backgroundColor:
                        member.avatarColor?.backgroundColor || "#e5e7eb",
                    }}
                  >
                    {`${member.firstName?.[0] || ""}${
                      member.lastName?.[0] || ""
                    }`.toUpperCase() || "U"}
                  </span>
                }
                avatarStyle={{
                  color: member.avatarColor?.color || "#6b7280",
                  backgroundColor:
                    member.avatarColor?.backgroundColor || "#e5e7eb",
                }}
                size="sm"
              />
              <span>
                {member.firstName} {member.lastName}
              </span>
              <span className={styles.memberRole}>
                {memberUsers[member.id]?.role || "Member"}
              </span>
              {isOwner && memberUsers[member.id]?.role !== "owner" && (
                <IconButton
                  ariaLabel={`Remove ${member.firstName} ${member.lastName}`}
                  variant="outline"
                  size="2xs"
                  disabled={removingMemberId !== null}
                  icon={
                    <Icon
                      type={IconTypes.Type.x}
                      w={10}
                      h={10}
                      stroke={tailwindColors.grey["2"]}
                    />
                  }
                  onClick={() => void onRemoveMember(member.id)}
                />
              )}
            </div>
          )) : (
            <div className={styles.memberEmptyText}>
              No members have joined this project yet.
            </div>
          )}
        </div>
      </div>

      {isOwner && <div className={styles.dangerZone}>
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
      </div>}

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          if (!isDeleting) setIsDeleteConfirmOpen(false);
        }}
        onCancel={() => {
          if (!isDeleting) setIsDeleteConfirmOpen(false);
        }}
        placement="center"
        title="Delete project?"
        okText={isDeleting ? "Deleting..." : "Delete Project"}
        cancelText="Cancel"
        showCancelButton
        onOk={() => {
          void onConfirmDeleteProject();
        }}
      >
        <p className={styles.deleteConfirmationText}>
          This action cannot be undone. Type{" "}
          <strong>{projectName}</strong> to confirm deletion.
        </p>
        <ChakraInput
          autoFocus
          aria-label="Project name confirmation"
          placeholder={projectName}
          value={deleteName}
          onChange={(event) => {
            setDeleteName(event.target.value);
            setDeleteError("");
          }}
        />
        {deleteError && (
          <p className={styles.deleteError} role="alert">
            {deleteError}
          </p>
        )}
      </Modal>
    </Modal>
  );
};

export default ProjectModal;
