export type StepCreator = {
  name: string;
  avatarUrl?: string;
};

const storageKey = "minder-step-creators";

const readCreators = (): Record<string, StepCreator> => {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load step creators:", error);
    return {};
  }
};

export const recordStepCreator = (stepId: string) => {
  try {
    const firstName = window.localStorage.getItem("userFirstName") || "";
    const lastName = window.localStorage.getItem("userLastName") || "";
    const email = window.localStorage.getItem("userEmail") || "";
    const name = `${firstName} ${lastName}`.trim() || email || "Guest";
    const avatarUrl = window.localStorage.getItem("userAvatarUrl") || undefined;
    const creator = { name, avatarUrl };

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ ...readCreators(), [stepId]: creator })
    );
    return creator;
  } catch (error) {
    console.error("Failed to save step creator:", error);
    return { name: "Unknown" };
  }
};

export const getStepCreator = (stepId: string): StepCreator | null =>
  readCreators()[stepId] || null;
