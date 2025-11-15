import { clsx, type ClassValue } from "clsx"
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDuration = (duration: number) => {
  const second = (duration % 60);
  const minutes = Math.floor((duration / 60));
  return `${minutes.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`
}

export const snakeCaseToTitle = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

}
export const compactDate = (commentDate?: string | Date | number | null) => {
  if (!commentDate) return "";

  let date: Date;
  if (typeof commentDate === "string" || typeof commentDate === "number") {
    date = new Date(commentDate as any);
  } else {
    date = commentDate as Date;
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) return "";

  return formatDistanceToNow(date, { addSuffix: true });
}
export const compactNumber = (commentLikes: number) => {
  return Intl.NumberFormat("en", {
    notation: "compact"
  }).format(commentLikes)
}


