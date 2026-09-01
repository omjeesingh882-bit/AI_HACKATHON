import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return formatDate(dateString);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    notice: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    event: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    hackathon: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    workshop: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    academic: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    club: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    career: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    exam: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    syllabus: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    department: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    general: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
  };
  return colors[category.toLowerCase()] || colors.general;
}