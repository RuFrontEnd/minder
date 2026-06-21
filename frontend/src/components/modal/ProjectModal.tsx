import React, { useEffect, useState } from "react";
import Modal from "@/components/modal";
import { getProjects, createProject, deleteProject } from "@/apis/project";
import * as ProjectTypes from "@/types/project";
import SquareButton from "@/components/squareButton";
import Icon from "@/components/icon";
import { tailwindColors } from "@/variables/colors";

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
      <div className="bg-white rounded shadow-md p-4 w-[600px]">
        <h3 className="text-lg font-medium mb-3">Projects</h3>

        <div className="mb-3">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New project name"
              className="flex-1 border rounded px-2 py-1"
            />
            <SquareButton
              size={36}
              onClick={handleCreate}
              content={<Icon w={16} h={16} fill={tailwindColors.grey["1"]} />}
              className="border"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-auto">
          {loading && <div>Loading...</div>}
          {!loading && projects.length === 0 && <div>No projects</div>}
          <ul>
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 border-b">
                <button className="text-left flex-1" onClick={() => handleSelect(p)}>
                  {p.name}
                </button>
                <div className="flex items-center gap-2">
                  <SquareButton
                    size={32}
                    className="border"
                    onClick={() => handleDelete(p.id)}
                    content={<Icon w={12} h={12} fill={tailwindColors.grey["1"]} />}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 rounded border">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
