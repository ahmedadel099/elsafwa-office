---
name: ui-ux-pro-max
description: >-
  UI/UX Pro Max guidelines for high-end Arabic RTL & LTR web applications.
  Provides luxury styling tokens, typography rules, glassmorphism aesthetics,
  responsive layouts, micro-animations, and printable document standards.
---

# UI/UX Pro Max Design Guidelines

This skill defines standard design principles for creating world-class Arabic-first (RTL) & English (LTR) web applications with high visual impact, crisp typography, and fluid micro-interactions.

---

## 1. Color Palette & Typography Tokens

### Primary Theme (Government & Professional Services):
- **Primary Emerald**: `#044E39` (Rich Egyptian Emerald)
- **Primary Emerald Hover**: `#065F46`
- **Secondary Warm Gold**: `#D4AF37` / `#B59226`
- **Accent Sapphire Blue**: `#1E3A8A`
- **Neutral Light Background**: `#F8FAFC`
- **Surface Light Card**: `#FFFFFF` with `border: 1px solid rgba(226, 232, 240, 0.8)`
- **Neutral Dark Background**: `#0F172A`
- **Dark Surface Card**: `#1E293B`

### Typography:
- **Arabic Fonts**: `Tajawal`, `Cairo`, or `Alexandria` from Google Fonts.
- **English Fonts**: `Inter`, `Plus Jakarta Sans`, or `Outfit`.
- **Direction**: Dynamic `dir="rtl"` for Arabic, `dir="ltr"` for English.

---

## 2. Component Design Principles

### A. Dynamic Layouts & Directional Switching
- Use Tailwind logical properties (e.g. `start-0`, `end-0`, `ms-auto`, `space-x-reverse`) or explicit `rtl:` prefixes to ensure seamless RTL and LTR support.
- Icons that represent progression (arrows, back buttons) must flip directionally in RTL mode.

### B. Micro-Interactions & Hover Polish
- Card hover states should utilize subtle elevation scale (`transform: translateY(-2px)`), soft shadow transitions (`shadow-md` to `shadow-xl`), and gold border glows (`border-amber-400/50`).
- Status timeline items must visually indicate active vs pending states with animated glowing indicator dots.

### C. Printable Arabic Receipts & Documents
- Implement clean print stylesheets (`@media print`):
  - Hide navigation bars, footers, action buttons, background overlays.
  - Reset body padding, set clean high-contrast black/white typography with official branding borders and QR verification stamps.

### D. Accessibility & Micro-Feedback
- Use clear visual badges for request status (`New`, `Under Review`, `Missing Documents`, `Approved`, `Completed`, `Cancelled`).
- Provide instant field feedback (e.g., duplicate phone alert modal, missing document counter badge).
