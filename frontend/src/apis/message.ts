import axios from "axios";

export type Message = {
  id: string;
  stepId: string;
  memberId: string;
  content: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

export const getMessages = (stepId: string) =>
  axios.get<Message[]>(`/steps/${stepId}/messages`);

export const createMessage = (
  stepId: string,
  payload: { content: string; comment?: string }
) => axios.post<Message>(`/steps/${stepId}/messages`, payload);
