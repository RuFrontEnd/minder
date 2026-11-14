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

const getStepDependencies = (projectId: string) =>
  axios.get<StepTypes.StepDependency[]>(
    `/Project/${projectId}/step-dependencies`
  );

const createStepDependency = (
  projectId: string,
  stepId: string,
  dependsOnStepId: string
) =>
  axios.put<StepTypes.StepDependency>(
    `/Project/${projectId}/steps/${stepId}/dependencies/${dependsOnStepId}`
  );

const deleteStepDependency = (
  projectId: string,
  stepId: string,
  dependsOnStepId: string
) =>
  axios.delete(
    `/Project/${projectId}/steps/${stepId}/dependencies/${dependsOnStepId}`
  );

export {
  createStep,
  createStepDependency,
  deleteStepDependency,
  getStepDependencies,
  getSteps,
  updateStepPosition,
};