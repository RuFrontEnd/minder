import * as ProjectTypes from "@/types/project";
import * as CommonTypes from "@/types/shapes/common";
import * as DecisionTypes from "@/types/shapes/decision";

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

type CurveInfo = {
  p1: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  p2: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  cp1: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  cp2: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  sendTo: null | {
    id: CommonTypes.Id;
    d: CommonTypes.Direction;
  };
};

type ProjectData = {
  projectId: ProjectTypes.Project["id"];
  projectName: ProjectTypes.Project["name"];
  orders: string[];
  shapes: {
    [shapeId: CommonTypes.Id]: {
      w: number;
      h: number;
      title: string;
      type: string;
      p: {
        x: number;
        y: number;
      };
      curves: {
        l: CommonTypes.Id[];
        t: CommonTypes.Id[];
        r: CommonTypes.Id[];
        b: CommonTypes.Id[];
      };
      data: CommonTypes.Id[];
      selectedData: CommonTypes.Id[];
      deletedData: CommonTypes.Id[];
      text: null | {
        l: DecisionTypes.Text;
        t: DecisionTypes.Text;
        r: DecisionTypes.Text;
        b: DecisionTypes.Text;
      };
    };
  };
  curves: {
    [curveId: CommonTypes.Id]: CurveInfo;
  };
  data: {
    [stringId: CommonTypes.Id]: string;
  };
};

type GetProject = {
  resData: ProjectData;
};

type UpdateShapes = {
  data: ProjectData;
}; // TOOD: 待替換

type DeleteShape = {
  data: {
    id: ProjectTypes.Project["id"];
  };
};

export type { GetProjects, GetProject, CreateProject, DeleteProject };
