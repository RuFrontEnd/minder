import axios from "axios";
import * as ProjectTypes from "@/types/project";

const getProjecs = async () => {
  return axios.get("/project/projects");
};

const getProject = async (id: number) => {
  return axios.get(`/project/projects/${id}`);
};

const createProject = async () => {
  return axios.post("/project/project");
};

const deleteProject = async (projectId: ProjectTypes.Project["id"]) => {
  return axios.delete("/project/project", {
    data: { id: projectId },
  });
};

export { getProjecs, getProject, createProject, deleteProject };
