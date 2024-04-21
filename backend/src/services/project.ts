import { Project as ProjectModel } from "../models";

export default class Auth {
  private projectModel = new ProjectModel();

  async getProjects(user: string) {
    const projects = await this.projectModel.getProjects(user);
    return projects.filter(project => ({
      id: project.id,
      name: project.name
    }))
  }

  async createProject(name: string, user: string) {
    await this.projectModel.createProject(name, user);
  }

  echo() {
    console.log("project service");
    this.projectModel.echo();
  }
}
