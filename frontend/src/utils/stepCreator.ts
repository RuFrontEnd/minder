export type StepCreator = {
  name: string;
  avatarUrl?: string;
  avatarColor?: string | null;
  avatarBackgroundColor?: string | null;
};

export const recordStepCreator = (_stepId: string) => null;

export const getStepCreator = (_stepId: string): StepCreator | null => null;
