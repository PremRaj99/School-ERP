// File: src/hooks/use-media-query.ts

"use client"

import * as React from "react"

/**
 * Custom hook to listen for a media query.
 *
 * @param query - A valid CSS media query string (e.g. "(min-width: 768px)")
 * @returns boolean - true if query matches, false otherwise
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQueryList = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial state
    setMatches(mediaQueryList.matches)

    // Add listener
    mediaQueryList.addEventListener("change", listener)

    return () => {
      mediaQueryList.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
