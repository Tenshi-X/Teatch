---
version: "alpha"
name: "Zapier Warm Automation"
description: "Zapier-inspired warm automation landing page. Ideal for automação, integrações, plataformas de workflow, ferramentas no-code. AI-ready template."
colors:
  primary: "#fffefb"
  secondary: "#201515"
  tertiary: "#ff4f00"
  neutral: "#c5c0b1"
  surface: "#eceae3"
  accent: "#36342e"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 4px
  md: 8px
  lg: 12px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Zapier-inspired warm automation landing page. Ideal for automação, integrações, plataformas de workflow, ferramentas no-code. AI-ready template. Zapier's visual language didn't start warm. Early iterations leaned into the cold utility of developer tools — dark backgrounds, monospace type, the usual SaaS grayscape. The pivot toward cream backgrounds and orange accents came around 2019-2020, when the product shifted its positioning from "developer glue" to "anyone can automate." That repositioning demanded a softer visual identity. The warmth wasn't decorative — it was strategic defusion of automation anxiety.

The flat-and-soft approach borrows from editorial design more than software design. Rounded corners got rounder. Shadows disappeared almost entirely in favor of subtle border treatments. The cream-to-white gradient backgrounds created depth without dimensionality. Orange became the action color — not aggressive red, not passive yellow, but the precise midpoint that says "this does something" without screaming urgency.

What makes this system interesting is how it handles complexity. Zapier's actual product is deeply technical — conditional logic, API mappings, error handling. The warm cream palette acts as emotional insulation, making users feel safe while doing genuinely complex things. It's the design equivalent of a therapist's office: deliberately non-threatening so the hard work can happen.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 4/10 — Subtle

- **Style:** Warm Cream Canvas, Orange Accent, Degular Display, Border-Forward, Tab Underlines
- **Keywords:** zapier, warm cream, orange accent, Degular Display, border-forward, tab underlines, Inter, GT Alpina, automation, workflow
- **Era:** 2024-2026 Warm Automation
- **Light/Dark:** ✓ Full / ✗ Not Recommended

## Colors

- **Creme** (#fffefb) — Primary surface or dominant color
- **Preto Quente** (#201515) — Dark surface, primary background
- **Laranja Zapier** (#ff4f00) — Warm accent, call-to-action secondary
- **Sand** (#c5c0b1) — Supporting palette color
- **Light Sand** (#eceae3) — Extended palette, decorative use
- **Charcoal** (#36342e) — Deep contrast surface
- **Warm Gray** (#939084) — Secondary text, borders, muted elements
- **Mid Warm** (#b5b2aa) — Extended palette, decorative use


## Typography

- **Display / Hero:** Inter — Weight 700, tight tracking, used for headline impact
- **Body:** Inter — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Inter — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Canvas creme quente (#fffefb) como papel não-branqueado. Texto near-black com subtom avermelhado (#201515). Degular Display para hero headlines com line-height 0.90 ultra-comprimido. Laranja Zapier (#ff4f00) para CTAs primários e indicadores de tab ativo. Design border-forward: bordas sand (#c5c0b1) como elemento estrutural principal em vez de sombras. Tab underlines via inset box-shadow. GT Alpina serif thin-weight para momentos editoriais. Botões com padding generoso (20px 24px).

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 4px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Pill-shaped (9999px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Pill-shaped (9999px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Canvas creme #fffefb
- Do Texto quente #201515
- Do Degular Display line-height 0.90
- Do Laranja #ff4f00 para CTAs
- Do Bordas sand como estrutura
- Do Tab underlines inset
- Do Padding generoso
- Do Responsivo


## Use Case

Automação, Integrações, Platforms de workflow, Tools no-code

<!-- Source: https://designmd.app/library/zapier-warm-automation · designmd.app -->
