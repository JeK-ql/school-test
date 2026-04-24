---
version: alpha
name: Shadow Leveling
description: Solo Leveling-inspired "System" interface — deep black canvas, monospaced display type, and a single neon accent that rotates by day of week.
colors:
  background: "#0A0A0A"
  surface: "#121215"
  surface-raised: "#1A1A20"
  border: "#2A2A33"
  on-surface: "#EDEDF2"
  on-surface-muted: "#8A8A99"
  on-surface-subtle: "#55555F"
  accent: "#00F2FF"
  accent-dim: "#007A82"
  success: "#00FF85"
  warning: "#FFD600"
  danger: "#FF005C"
  day-mon: "#00F2FF"
  day-tue: "#00FF85"
  day-wed: "#FFD600"
  day-thu: "#FF7A00"
  day-fri: "#FF005C"
  day-sat: "#BD00FF"
  day-sun: "#4F4F4F"
typography:
  display-hero:
    fontFamily: Orbitron
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0.04em
  display-lg:
    fontFamily: Orbitron
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0.06em
  display-md:
    fontFamily: Orbitron
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: 0.08em
  label-system:
    fontFamily: Orbitron
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.2em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.02em
  mono-stat:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    fontFeature: '"tnum" 1'
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  "0": 0px
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 24px
  "6": 32px
  "7": 48px
  "8": 64px
components:
  button-primary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.accent}"
    typography: "{typography.label-system}"
    rounded: "{rounded.sm}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.accent-dim}"
    textColor: "{colors.background}"
  button-primary-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-system}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-danger:
    backgroundColor: "{colors.background}"
    textColor: "{colors.danger}"
    typography: "{typography.label-system}"
    rounded: "{rounded.sm}"
    padding: 14px
  card-skill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 20px
  progress-bar-track:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.full}"
    height: 6px
  progress-bar-fill:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
    height: 6px
  system-message-levelup:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    typography: "{typography.display-md}"
    rounded: "{rounded.md}"
    padding: 24px
  system-message-penalty:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    typography: "{typography.display-md}"
    rounded: "{rounded.md}"
    padding: 24px
  answer-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 16px
  answer-option-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.accent}"
  answer-option-correct:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
  answer-option-wrong:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
  timer-badge:
    backgroundColor: "{colors.background}"
    textColor: "{colors.accent}"
    typography: "{typography.mono-stat}"
    rounded: "{rounded.sm}"
    padding: 6px
---

## Overview

Shadow Leveling dresses an interview-prep app as the "System" HUD from the manhwa *Solo Leveling*: a black void interface where a single neon accent carries every signal — progress, focus, danger. The UI should feel diegetic, like a heads-up display summoned in front of the user, not a normal web page. Restraint is the point: one accent per surface at a time, thin hairline borders, monospaced numerals, and hard-edged rectangles punctuated only by the occasional soft-corner card.

The accent color is **dynamic by weekday** (`colors.day-mon` … `colors.day-sun`). At runtime the theme engine writes the active day's hex into `colors.accent`. All component tokens reference `{colors.accent}` rather than a fixed hue so the entire interface re-tints in one move when the day flips over.

## Colors

- **background (#0A0A0A)** — the void. Every screen starts from this. Never use pure `#000` (loses depth against OLED) and never use white as a background.
- **surface (#121215)** and **surface-raised (#1A1A20)** — barely-there elevations for cards, modals, and hover states. Contrast comes from the accent glow, not from lightening these surfaces too much.
- **border (#2A2A33)** — 1px hairlines. Prefer borders over background shifts to separate regions; the System aesthetic reads as wireframed panels.
- **on-surface / on-surface-muted / on-surface-subtle** — three steps of cool off-white for primary text, secondary labels, and decorative metadata. Always check WCAG AA against `background`.
- **accent** — the active day's neon. Drives the single primary CTA on screen, active progress fills, focus rings, and any numeric stat the user should look at first.
- **accent-dim** — a ~50%-luminance partner used for hover backgrounds so the full-brightness accent stays reserved for the "pressed / active" state.
- **success / warning / danger** — reserved for feedback states (`+1` correct, timer running low, wrong answer / penalty). They intentionally overlap with specific day-accents, which is fine because they never appear together with the matching day.
- **day-mon … day-sun** — the seven rotating neons from `themeEngine.ts`. Treat these as *source* tokens; components should never reference them directly, only `colors.accent`.

## Typography

Two typefaces, two jobs:

- **Orbitron** — geometric, wide-tracked, slightly sci-fi. Used exclusively for HUD-style text: screen titles, "SYSTEM" labels, Level Up banners, button labels. Generous `letterSpacing` (0.04em – 0.2em) is what sells the "interface chrome" feel; don't tighten it.
- **Inter** — neutral, highly legible. Used for everything a user actually reads: question prompts, explanations, answer options, body copy.
- **JetBrains Mono** (`mono-stat`) — tabular figures for XP counters, timers, accuracy percentages. The `"tnum" 1` feature keeps numbers from jittering as they tick.

`label-system` (12px / 0.2em tracking) is the signature System label style — use it for any decorative piece of UI chrome ("STATUS", "LEVEL", "XP", the primary-CTA text). `display-*` sizes are for moments, not paragraphs.

## Layout

The grid is wide-gutter and vertically generous: the void needs room to breathe around HUD elements, otherwise the effect collapses into a normal dark-mode dashboard.

- Base unit is **4px** (`spacing.1`). Component internal padding lives in the 12–24px range (`spacing.3`–`spacing.5`).
- Section separators are **48–64px** (`spacing.7`–`spacing.8`) — deliberately oversized so each HUD panel feels like its own summoned window.
- Content max-width: **720px** for question/test flows (single-column focus), **1120px** for the dashboard.
- Answer options stack vertically on mobile and form a 2×2 grid at ≥640px viewport width.

## Elevation & Depth

Shadow Leveling replaces traditional drop-shadows with **neon glow**. Elevation is signaled by luminance from the element itself, not from a shadow cast behind it.

- **Resting** — no shadow, no glow. Just the surface color against the background.
- **Focused / active CTA** — outer glow: `0 0 24px {colors.accent}` at 40% opacity. This is what sells "the System is reacting to you."
- **Correct answer flash** — outer glow in `{colors.success}` for 300ms, then fade.
- **Penalty / wrong answer** — outer glow in `{colors.danger}`, plus a 1-frame x-axis shake.
- **Level Up modal** — full-screen dim (background at 85% opacity over content) with the banner glowing in the active accent.

Never stack glows. One element is glowing at a time. A glowing screen is a screaming screen.

## Shapes

Hard rectangles are the default. `rounded.sm` (2px) and `rounded.md` (4px) are the only corner radii you should reach for without thinking — they read as "terminal window," not "app card." Reserve `rounded.lg`/`xl` for the avatar / profile chip, and `rounded.full` for progress-bar tracks and circular XP badges. Never mix a pill-shaped button with a rectangular button on the same screen.

## Components

- **button-primary** — the Do-The-Thing button. Transparent-on-void fill with the accent color as text and a 1px accent border; on hover it fills with `accent-dim`; on press it fills fully with `accent` and the text flips to `background`. There is **one** of these per screen.
- **button-ghost** — secondary actions ("Skip", "Back", "Change difficulty"). Muted-text, borderless, the visual weight of a menu item.
- **button-danger** — reserved for the "Вірної відповіді немає" / "No correct answer" action during a test. Using the danger color here is intentional: the action itself carries risk (±2 vs –1).
- **card-skill** — the dashboard skill card. Surface background, 1px border, title in `display-md`, level/XP in `mono-stat`, accent-colored progress bar pinned to the bottom edge.
- **progress-bar-track / progress-bar-fill** — the XP bar. Always rendered with `rounded.full`. The fill uses the current accent; the last-run accuracy percent sits to the right in `mono-stat`.
- **system-message-levelup / system-message-penalty** — the big moments. Centered modal, surface background, display-sized accent or danger text, 400ms glow pulse on mount. These are the reward loop — don't underplay them.
- **answer-option** — full-width row during a test. Default state is quiet (`on-surface` text on `surface`). Hover tints the text to the accent. Post-answer, the state freezes to `success` or `danger` for the explanation beat.
- **timer-badge** — top-right of the test screen. Monospaced, accent-colored, gains a pulsing danger glow in the final 3 seconds regardless of difficulty.

## Do's and Don'ts

- **Do** keep exactly one element glowing on screen at any time. Glow is the System's voice; two glows is two voices.
- **Do** let every component pull its accent from `{colors.accent}` so the daily theme engine can re-tint the whole UI by writing one CSS variable.
- **Do** use `label-system` (Orbitron, wide tracking, uppercase) for all HUD chrome — button labels, status pills, section kickers.
- **Do** prefer hairline borders (`colors.border`) over background lightening to separate surfaces.
- **Do** use `mono-stat` for every number the user tracks (XP, level, timer, accuracy) so values don't jitter as they update.
- **Don't** use pure white text or pure black backgrounds. `on-surface` and `background` are warmer and have more depth on OLED.
- **Don't** introduce a second accent color within the same screen. If you need a second signal, use `success` / `warning` / `danger`, which are semantically scoped.
- **Don't** apply drop shadows. This system uses glow; a shadow reads as "material design" and breaks the HUD illusion.
- **Don't** reference `colors.day-*` tokens directly from components — always go through `colors.accent`.
- **Don't** mix corner radii within a single view. Pick the rectangular family (`sm`/`md`) or the soft family (`lg`/`xl`) per screen.
- **Don't** animate the accent color between days. The theme change happens on page load, not as a live transition.
