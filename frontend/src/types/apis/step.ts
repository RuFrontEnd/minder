type CreateStepRequest = {
  title: string;
  description: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

type UpdateStepPositionRequest = {
  x: number;
  y: number;
};

type StepResponse = {
  id: string;
  projectId: string;
  creatorId: string;
  ownerId: string;
  title: string;
  description: string;
  width: number;
  height: number;
  x: number;
  y: number;
  status: string;
};

export type { CreateStepRequest, StepResponse, UpdateStepPositionRequest };