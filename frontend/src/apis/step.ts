import axios from "axios";
import * as StepTypes from "@/types/apis/step";

const createStep = (projectId: string, payload: StepTypes.CreateStepRequest) =>
  axios.post<StepTypes.StepResponse>(`/Project/${projectId}/steps`, payload);

const getSteps = (projectId: string) =>
  axios.get<StepTypes.StepResponse[]>(`/Project/${projectId}/steps`);

const updateStepPosition = (
  projectId: string,
  stepId: string,
  payload: StepTypes.UpdateStepPositionRequest
) =>
  axios.patch<StepTypes.StepResponse>(
    `/Project/${projectId}/steps/${stepId}/position`,
    payload
  );

export { createStep, getSteps, updateStepPosition };