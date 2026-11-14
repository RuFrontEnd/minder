type CreateStepRequest = {
  title: string;
  description: string;
  ac: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

type UpdateStepPositionRequest = {
  x: number;
  y: number;
};

type UpdateStepDetailsRequest = {
  title: string;
  description: string;
  ac: string;
};

type StepDependency = {
  stepId: string;
  dependsOnStepId: string;
};

type StepResponse = {
  id: string;
  projectId: string;
  creatorId: string;
  ownerId: string;
  title: string;
  description: string;
  ac: string;
  width: number;
  height: number;
  x: number;
  y: number;
  status: string;
};

export type {
  CreateStepRequest,
  StepDependency,
  StepResponse,
  UpdateStepDetailsRequest,
  UpdateStepPositionRequest,
};