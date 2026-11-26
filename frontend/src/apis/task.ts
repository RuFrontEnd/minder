import axios from "axios";

export type Task = {
  id: string;
  stepId: string;
  title: string;
  description: string;
  completed: boolean;
  ownerId: string;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  completed?: boolean;
  ownerId: string;
};

export type UpdateTaskRequest = CreateTaskRequest;

export const getTasks = (stepId: string) =>
  axios.get<Task[]>(`/steps/${stepId}/tasks`);

export const createTask = (stepId: string, payload: CreateTaskRequest) =>
  axios.post<Task>(`/steps/${stepId}/tasks`, payload);

export const updateTask = (
  stepId: string,
  taskId: string,
  payload: UpdateTaskRequest
) => axios.put<Task>(`/steps/${stepId}/tasks/${taskId}`, payload);
