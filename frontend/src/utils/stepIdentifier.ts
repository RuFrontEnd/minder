import * as CommonTypes from "@/types/common";

export const ensureStepIdentifiers = (shapes: CommonTypes.Shapes) => {
  let nextNumber = Math.max(
    1,
    ...shapes.map((shape) => shape.epNumber + 1)
  );
  const usedNumbers = new Set<number>();

  shapes.forEach((shape) => {
    if (
      !Number.isSafeInteger(shape.epNumber) ||
      shape.epNumber <= 0 ||
      usedNumbers.has(shape.epNumber)
    ) {
      shape.epNumber = nextNumber;
      nextNumber += 1;
    }
    usedNumbers.add(shape.epNumber);
  });
};

export const assignStepIdentifier = (
  shape: CommonTypes.Step,
  shapes: CommonTypes.Shapes
) => {
  ensureStepIdentifiers(shapes);
  ensureStepIdentifiers([...shapes, shape]);
};
