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
export type { ProjectUpdatedEvent };
