export type StepCreator = {
  name: string;
  avatarUrl?: string;
};

export const recordStepCreator = (_stepId: string) => null;

export const getStepCreator = (_stepId: string): StepCreator | null => null;
