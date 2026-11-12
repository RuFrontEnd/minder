import axios from "axios";
import * as StepTypes from "@/types/apis/step";

const createStep = (projectId: string, payload: StepTypes.CreateStepRequest) =>
  axios.post<StepTypes.StepResponse>(`/Project/${projectId}/steps`, payload);

const getSteps = (projectId: string) =>
  axios.get<StepTypes.StepResponse[]>(`/Project/${projectId}/steps`);

export { createStep, getSteps };