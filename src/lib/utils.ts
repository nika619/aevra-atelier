import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
