// src/lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Склейка классов:
 * - clsx позволяет использовать условные классы
 * - twMerge убирает конфликты tailwind (например, "p-2 p-4" → "p-4")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}