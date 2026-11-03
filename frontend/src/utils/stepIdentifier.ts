import * as CommonTypes from "@/types/common";

const storageKey = "minder-step-identifiers";

type StoredIdentifiers = {
  nextNumber: number;
  identifiers: Record<string, number>;
};

const readStoredIdentifiers = (): StoredIdentifiers => {
  if (typeof window === "undefined") {
    return { nextNumber: 1, identifiers: {} };
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return { nextNumber: 1, identifiers: {} };

  const parsed: unknown = JSON.parse(stored);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("identifiers" in parsed) ||
    typeof parsed.identifiers !== "object" ||
    parsed.identifiers === null
  ) {
    throw new Error("Stored step identifiers have an invalid format.");
  }

  const identifiers = parsed.identifiers as Record<string, number>;
  const nextNumber =
    "nextNumber" in parsed &&
    typeof parsed.nextNumber === "number" &&
    Number.isSafeInteger(parsed.nextNumber) &&
    parsed.nextNumber > 0
      ? parsed.nextNumber
      : 1;

  return { nextNumber, identifiers };
};

const writeStoredIdentifiers = (stored: StoredIdentifiers) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(stored));
};

export const ensureStepIdentifiers = (shapes: CommonTypes.Shapes) => {
  const stored = readStoredIdentifiers();
  const identifiers = { ...stored.identifiers };
  let nextNumber = Math.max(
    stored.nextNumber,
    ...Object.values(identifiers).map((number) => number + 1),
    ...shapes.map((shape) => shape.epNumber + 1)
  );
  let changed = false;

  shapes.forEach((shape) => {
    const storedNumber = identifiers[shape.id];
    if (Number.isSafeInteger(storedNumber) && storedNumber > 0) {
      shape.epNumber = storedNumber;
      return;
    }

    if (Number.isSafeInteger(shape.epNumber) && shape.epNumber > 0) {
      identifiers[shape.id] = shape.epNumber;
    } else {
      shape.epNumber = nextNumber;
      identifiers[shape.id] = nextNumber;
      nextNumber += 1;
    }
    changed = true;
  });

  const nextStoredNumber = Math.max(
    nextNumber,
    ...Object.values(identifiers).map((number) => number + 1)
  );
  if (changed || stored.nextNumber !== nextStoredNumber) {
    writeStoredIdentifiers({
      nextNumber: nextStoredNumber,
      identifiers,
    });
  }
};

export const assignStepIdentifier = (
  shape: CommonTypes.Shape,
  shapes: CommonTypes.Shapes
) => {
  ensureStepIdentifiers(shapes);
  ensureStepIdentifiers([...shapes, shape]);
};
