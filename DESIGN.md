# Crimson Forge Design System

### 1. Overview & Creative North Star

**Creative North Star: The Industrial Alchemist**
Crimson Forge is a high-performance, dark-themed design system engineered for strength and precision. It moves away from the "standard dashboard" aesthetic by embracing a deep, monochromatic red-black base contrasted with high-energy "Ignition Red" accents. The system favors a low-roundedness, high-density layout that feels mechanical and bespoke, utilizing transparency and tonal layering rather than physical borders to organize information.

### 2. Colors

The palette is built on a foundation of deep carbon and oxblood tones, punctuated by a singular, vibrant primary red (` `).

- **Primary (Ignition Red):** Used exclusively for high-intent actions and brand-defining icons.
- **The "No-Line" Rule:** Section boundaries are never defined by 1px solid neutral lines. Instead, use `primary/10` or `primary/20` (low opacity red) to create "energy borders" or rely on surface shifts between `surface_container` and `surface_dim`.
- **Surface Hierarchy:**
  - **Level 0 (Background):** `#221010`
  - **Level 1 (Cards/Sidebar):** `surface_container_low`
  - **Level 2 (Active States):** `primary/10`
- **Glass & Gradient:** Use `backdrop-blur-md` on top headers and floating navigation panels to maintain a sense of depth and fluidity.

### 3. Typography

The system exclusively utilizes **Lexend**, a typeface designed for variable reading speeds, mirroring the performance-oriented nature of the brand.

**Typography Scale:**

- **Display/Hero:** 1.5rem (24px) - Bold. Used for high-level metrics and impact headers.
- **Headline/Subheader:** 1.125rem (18px) - Bold. For section titles.
- **Body (Default):** 0.875rem (14px) - Medium. The primary workhorse for tables and descriptions.
- **Label/Caption:** 0.75rem (12px) - Medium/Semibold. Used for secondary metadata.
- **Micro:** 10px - Heavy Bold. Used for status badges (e.g., "PROCESSING") with high letter-spacing.

The typographic rhythm is intentionally tight, focusing on "Information Density" over "Generous Whitespace."

### 4. Elevation & Depth

Depth is achieved through "Tonal Stacking" rather than elevation shadows.

- **The Layering Principle:** Rather than using shadows to lift elements, we use darker background layers (`#140808`) for the "base" and lighter, tinted surfaces (`#221010`) for the "interactive" layers.
- **Ambient Shadows:** When shadows are required (e.g., Primary Buttons), use a "Glow Shadow" technique: `shadow-lg shadow-primary/20`. This creates a light-bleed effect rather than a structural shadow.
- **Shadow GROUND TRUTH:**
  - `shadow-sm`: Used for card containers to provide a subtle lift.
  - `shadow-lg`: Reserved for primary action buttons to simulate an "active" or "powered-on" state.

### 5. Components

- **Buttons:** Primary buttons are solid `#f20d0d` with sharp `0.125rem` (roundedness: 1) corners. Ghost buttons use a `primary/10` background with red text.
- **Input Fields:** Ghost-style inputs with a `primary/5` background and no border. On focus, a `primary/50` ring creates an "ignition" effect.
- **Status Badges:** High-contrast, pill-shaped (full-round) tags using 20% opacity backgrounds of the status color (e.g., Green for success, Yellow for processing).
- **Data Tables:** Clean, no-border rows. Hover states use a subtle `primary/5` wash to guide the eye without breaking the dark-mode immersion.
- **Scrollbars:** Custom slim-line scrollbars using `secondary_bright` (`#492222`) for the thumb.

### 6. Do's and Don'ts

- **Do:** Use opacity variants of the primary color (e.g., `primary/10`) for hover states and borders.
- **Do:** Maintain high contrast between primary text (`#ffffff`) and background.
- **Don't:** Use generic grey scales. Every neutral in this system is "warm," containing a hint of red or brown.
- **Don't:** Use large border-radii. Keep it sharp (0.125rem to 0.25rem) to maintain the "Industrial" feel.
- **Do:** Ensure "Micro" typography (10px) is always in uppercase with at least 0.05em tracking for legibility.
