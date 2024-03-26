import { Project as ProjectModel } from "../models";

export default class Project {
  private projectModel = new ProjectModel();

  echo() {
    console.log("article service");
    this.projectModel.echo();
  }
}
