import { Shape as ShapeModel } from "../models";

export default class Shape {
  private shpaeModel = new ShapeModel();

  // async getProjects(user: string) {
  //   const projects = await this.shpaeModel.getProjects(user);
  //   return projects.filter(project => ({
  //     id: project.id,
  //     name: project.name
  //   }))
  // }

  // async createProject(name: string, user: string) {
  //   await this.shpaeModel.createProject(name, user);
  // }
}
