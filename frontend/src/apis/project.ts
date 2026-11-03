import axios from "axios";
import * as ProjectTypes from "@/types/project";
import * as ProjectAPITypes from "@/types/apis/project";

const prefix = "/project";

// backend API (WebApi) endpoints under /api/Project
const getProjects = async () => {
  return axios.get(`/Project`);
};

const createProject = async (name: string) => {
  return axios.post(`/Project`, { name });
};

const deleteProject = async (id: number) => {
  return axios.delete(`/Project/${id}`);
};

const getProject = async (id: number | string) => {
  return axios.get(`/Project/${id}`);
};

const updateProject = async (
  id: number,
  _data: ProjectAPITypes.UpdateProject["data"]
) => {
  return axios.put(`${prefix}/projects/${id}`, {
    data: _data,
  });
};

const updateProjectName = async (id: number | string, name: string) => {
  return axios.put(`/Project/${id}`, { name });
};

export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectName,
  deleteProject,
};
