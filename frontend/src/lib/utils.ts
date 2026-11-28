import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getAvatarInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toLowerCase() || "u";
  }

  const singlePart = parts[0] || "";
  const initials = /^\D\d/.test(singlePart)
    ? singlePart.slice(0, 2)
    : singlePart.slice(0, 1);

  return initials.toLowerCase() || "u";
}
