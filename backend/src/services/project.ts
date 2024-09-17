import * as AuthTypes from "../types/auth";
import * as ProjectTypes from "../types/project";
import { Project as ProjectModel } from "../models";

export default class Project {
  private projectModel = new ProjectModel();

  async getProjects(userId: AuthTypes.UserId) {
    const projects = await this.projectModel.getProjects(userId);
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      img: project.img,
    }));
  }

  async getProject(id: number) {
    const project = await this.projectModel.getProject(id);
    return project;
  }

  async createProject(user: string) {
    const newProject = await this.projectModel.createProject(user);
    return newProject;
  }

  async updateProject(
    id: number,
    data: ProjectTypes.UpdateProject["req"]["data"]
  ) {
    return this.projectModel.updateProject(id, data);
  }

  async updateProjectName(
    id: number,
    data: ProjectTypes.UpdateProjectName["req"]["data"]
  ) {
    return this.projectModel.updateProjectName(id, data);
  }

  async deleteProject(userId: AuthTypes.UserId, id: ProjectTypes.Id) {
    await this.projectModel.deleteProject(userId, id);
  }

  echo() {
    console.log("project service");
    this.projectModel.echo();
  }
}
