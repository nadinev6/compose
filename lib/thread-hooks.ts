import React, { useCallback, useRef, useState } from "react";

/**
 * Custom thread management hooks for Tambo components
 * These are utility hooks that the Tambo UI components depend on
 */

export function useMergedRef<T = any>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return useCallback(
    (value: T) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(value);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });
    },
    refs
  );
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useCanvasDetection() {
  const [isCanvas, setIsCanvas] = useState(false);
  
  return {
    isCanvas,
    setIsCanvas,
  };
}

export function usePositioning() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  return {
    position,
    setPosition,
  };
}

/**
 * Converts message content into a safely renderable format.
 * Primarily joins text blocks from arrays into a single string.
 */
export function getSafeContent(
  content: any | React.ReactNode | undefined | null,
): string | React.ReactElement {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (React.isValidElement(content)) return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (item && item.type === "text" ? (item.text ?? "") : ""))
      .join("");
  }
  return "Invalid content format";
}

/**
 * Checks if message content contains meaningful, non-empty text or images.
 */
export function checkHasContent(
  content: any | React.ReactNode | undefined | null,
): boolean {
  if (!content) return false;
  if (typeof content === "string") return content.trim().length > 0;
  if (React.isValidElement(content)) return true;
  if (Array.isArray(content)) {
    return content.some((item) => {
      if (!item || typeof item !== "object") return false;
      if (item.type === "text") return !!item.text?.trim();
      if (item.type === "image_url") return !!item.image_url?.url;
      return false;
    });
  }
  return false;
}

/**
 * Extracts image URLs from message content array.
 */
export function getMessageImages(
  content: { type?: string; image_url?: { url?: string } }[] | undefined | null,
): string[] {
  if (!content) return [];

  return content
    .filter((item) => item?.type === "image_url" && item.image_url?.url)
    .map((item) => item.image_url!.url!);
}