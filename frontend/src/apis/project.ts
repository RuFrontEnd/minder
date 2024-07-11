import axios from "axios";
import * as ProjectTypes from "@/types/project";
import * as ProjectAPITypes from "@/types/apis/project";

const prefix = "/project";

const getProjecs = async () => {
  return axios.get(`${prefix}/projects`);
};

const getProject = async (id: number) => {
  return axios.get(`${prefix}/projects/${id}`);
};

const createProject = async () => {
  return axios.post(`${prefix}/project`);
};

const updateProject = async (
  id: number,
  _data: ProjectAPITypes.UpdateProject["data"]
) => {
  return axios.put(`${prefix}/projects/${id}`, {
    data: _data,
  });
};

const updateProjectName = async (
  id: number,
  _data: ProjectAPITypes.UpdateProjectName["data"]
) => {
  return axios.put(`${prefix}/projects/${id}/name`, {
    data: _data,
  });
};

const deleteProject = async (projectId: ProjectTypes.Project["id"]) => {
  return axios.delete(`${prefix}/project`, {
    data: { id: projectId },
  });
};

export {
  getProjecs,
  getProject,
  createProject,
  updateProject,
  updateProjectName,
  deleteProject,
};
