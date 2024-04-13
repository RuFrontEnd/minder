import { Project as ProjectModel } from "../models";

export default class Auth {
  private projectModel = new ProjectModel();

  async create(name: string, user: string) {
    await this.projectModel.create(name, user);
  }

  echo() {
    console.log("project service");
    this.projectModel.echo();
  }
}
