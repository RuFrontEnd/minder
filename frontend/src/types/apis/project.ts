import * as ProjectTypes from "@/types/project";

type GetProjects = {
  resData: ProjectTypes.Project[];
};

type CreateProject = {
  resData: {
    status: string;
    message: "Create project successfully!";
    id: ProjectTypes.Project["id"];
    user: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
};

type DeleteProject = {
  resData: {
    status: string;
    message: "Delete project successfully!";
    id: number;
  };
};

export type { GetProjects, CreateProject, DeleteProject };
