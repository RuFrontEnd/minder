import axios from "axios";
import * as ProjectTypes from "@/types/project";
import * as ProjectAPITypes from "@/types/apis/project";

const getProjecs = async () => {
  return axios.get("/project/projects");
};

const getProject = async (id: number) => {
  return axios.get(`/project/projects/${id}`);
};

const createProject = async () => {
  return axios.post("/project/project");
};

const updateProject = async (
  id: number,
  _data: ProjectAPITypes.UpdateProject["data"]
) => {
  return axios.put(`/project/projects/${id}`, {
    data: _data,
  });
};

const deleteProject = async (projectId: ProjectTypes.Project["id"]) => {
  return axios.delete("/project/project", {
    data: { id: projectId },
  });
};

export { getProjecs, getProject, createProject, updateProject, deleteProject };
