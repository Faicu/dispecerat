// Mobile-specific configuration — single source of truth for mobile layout constants.
// Import this instead of scattering magic numbers across components.

/** Matches Tailwind's `md` breakpoint (768 px). */
export const MOBILE_BREAKPOINT = 768;

/** Returns true when the current viewport is narrower than the md breakpoint. */
export const isMobileDevice = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

/**
 * Use `100dvh` instead of `100vh` so the layout accounts for the browser
 * chrome (address bar) on mobile Safari / Chrome.  Falls back gracefully in
 * environments that don't support dvh yet.
 */
export const FULL_HEIGHT_STYLE = { height: '100dvh' } as const;

/** Height of the mobile bottom navigation bar (keep in sync with `h-16`). */
export const MOBILE_NAV_HEIGHT_PX = 64;

/**
 * Minimum milliseconds between a marker selection event and a map-click
 * event before the map-click is treated as an intentional deselect.
 */
export const MAP_CLICK_DEBOUNCE_MS = 600;
