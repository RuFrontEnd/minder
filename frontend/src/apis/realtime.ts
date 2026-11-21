import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

type ProjectUpdatedEvent = {
  eventType: string;
  projectId: string;
  data: unknown;
  updatedBy: string;
  occurredAt: string;
};

type ProjectUser = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  avatarBackgroundColor: string | null;
  role: string;
};

type ProjectCursor = {
  userId: string;
  position: {
    x: number;
    y: number;
  };
};

const createProjectConnection = (): HubConnection => {
  const token = typeof window === "undefined"
    ? null
    : window.localStorage.getItem("Authorization");

  return new HubConnectionBuilder()
    .withUrl(
      process.env.NEXT_PUBLIC_SIGNALR_URL ||
        "http://localhost:5000/hubs/project",
      {
        accessTokenFactory: () => token || "",
        withCredentials: true,
      }
    )
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
};

export { createProjectConnection };
export type { ProjectUpdatedEvent, ProjectUser, ProjectCursor };
