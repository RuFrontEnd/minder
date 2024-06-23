import * as AuthTypes from "../types/auth";
import * as ProjectTypes from "../types/project";
import { Project as ProjectModel } from "../models";

export default class Auth {
  private projectModel = new ProjectModel();

  async getProjects(user: string) {
    const projects = await this.projectModel.getProjects(user);
    return projects.filter((project) => ({
      id: project.id,
      name: project.name,
    }));
  }

  async createProject(user: string) {
    const newProject = await this.projectModel.createProject(user);
    return newProject;
  }

  async deleteProject(userId: AuthTypes.UserId, id: ProjectTypes.Id) {
    await this.projectModel.deleteProject(userId, id);
  }

  echo() {
    console.log("project service");
    this.projectModel.echo();
  }
}
