# hackTime — Brand Guidelines

## 1. Brand Overview

**Product Name:** hackTime  
**Type:** Hackathon Timer / Countdown System  
**Core Idea:** A high-intensity, visually striking timer system designed for hackathons

## 2. Brand Personality

hackTime is NOT calm or corporate.
It is:
- Electric
- High-energy
- Hacker-centric
- Futuristic
- Night-mode native

### Keywords (IMPORTANT for LLM)
cyberpunk, neon, hacker, glow, terminal, high-contrast, electric, after-dark

## 3. Visual Direction

### Core Aesthetic
- Dark canvas + neon highlights
- Strong glow accents
- Card-based modular layout
- “Hackathon poster meets dashboard”

### Reference Feel
- Hackathon promo posters
- Web3 landing pages
- Dev dashboards with personality


## 4. Color System

## 4.1 Primary Palette (STRICT)

| Name            | Hex       | Usage |
|-----------------|----------|------|
| Neon Fuchsia    | `#FF2E9A` | Highlights, accents |
| Electric Indigo | `#5D00FF` | Primary gradient base |
| Cyber Lime      | `#CFFF04` | CTA / emphasis |
| Graphite Black  | `#1C1C1C` | Background |


## 4.2 Gradient Usage (CRITICAL)

Primary gradient:
#5D00FF → #FF2E9A

Rules:
- Use gradients ONLY for hero components (timer card)
- Never overuse gradients globally
- Keep background mostly dark

## 4.3 Background System

- Base: `#0F0F10` (slightly darker than graphite)
- Cards: `#1C1C1C`
- Elevated cards: subtle border + inner glow

## 5. Typography

## 5.1 Fonts (STRICT)

Primary:
- IBM Plex Mono
- Inconsolata

Fallback:
- monospace


## 5.2 Typography Rules

### Timer
- MUST be monospace
- Large, spaced digits
- Format: 14 : 32 : 09

### Labels
- Uppercase
- Slight letter spacing

### Headings
- Bold but minimal decoration

## 6. Layout System

## 6.1 Structure

Grid-based card layout:

[ Header ]
[ BIG TIMER CARD ][ SIDE INFO ]
[ STATS ][ TEAM ][ CTA ]
[ FOOTER INFO ]

## 6.2 Layout Behavior

- Asymmetric but balanced
- Hero timer dominates left/center
- Supporting cards surround

## 7. Core Components

## 7.1 Timer Card (PRIMARY COMPONENT)

### Visual Style
- Large rounded card
- Gradient background
- Soft radial glow

### Content
- Label: "TIME REMAINING"
- Timer (HH : MM : SS)
- Subtext (deadline info)

### Behavior
- Always visually dominant
- Must be the largest element on screen

## 7.2 Tag Pills

Examples:
- Design
- AI / ML
- Web3

### Style
- Rounded pills
- Bright neon backgrounds
- Minimal text

## 7.3 Stats Card

Example:
- "247 Registered Teams"

### Features
- Progress bar
- Neon highlight on numbers
- Dark background

## 7.4 CTA Buttons

### Style
- Cyber Lime background OR outline
- Slight glow on hover
- Rounded

States:
- Default
- Hover (glow increase)
- Disabled (muted)

## 7.5 Info Cards

Examples:
- Team info
- Hacker energy
- Features list

### Style
- Dark cards
- Subtle borders
- Occasional neon accent

## 8. Iconography

### Style
- Thin line icons
- Minimal strokes
- Color-coded (NOT monochrome)

### Examples from board
- Clock variations
- Infinity time
- Delivery / motion

## 9. Motion & Effects

## 9.1 Glow System (IMPORTANT)

Use glow sparingly:
- Timer card → YES
- CTA hover → YES
- Everything else → minimal

Glow color = same as element color

## 9.2 Animation

- Smooth transitions (200ms ease-out)
- No heavy motion
- Subtle pulsing allowed on timer

## 10. Data Visualization

### Progress bars
- Thin
- Neon colored
- High contrast against dark bg

## 11. Content Style

### Tone
- Direct
- Minimal
- Hacker-style phrases

Examples:
- "Build the future."
- "Code. Create. Ship."
- "Submissions close Sunday 6 PM"

## 12. Accessibility Constraints

Even with neon:
- Maintain contrast
- Avoid unreadable glow over text
- Ensure timer readability always

## 13. Do / Don’t

### DO
- Use bold neon accents
- Keep dark dominance
- Highlight key numbers
- Use modular cards

### DON’T
- Use light backgrounds
- Overuse gradients
- Add soft pastel colors
- Make UI look corporate

## 14. LLM UI Generation Rules (CRITICAL)

When generating UI:

### MUST:
- Use dark background
- Use neon accents from palette
- Make timer the largest element
- Use card-based layout
- Use monospace font for time

### MUST NOT:
- Use generic SaaS UI
- Use white backgrounds
- Use soft shadows instead of glow
- Center everything symmetrically

## 15. Design DNA Summary

hackTime =
> Neon + Dark + Hacker Energy + Time Pressure

## 16. One-line Prompt (for LLM reuse)

"Design a cyberpunk-style hackathon timer UI with a large glowing gradient countdown, dark background, neon accents (fuchsia, indigo, lime), monospace typography, and modular dashboard cards."

## 17. Visual Comfort & Anti-Harshness Rules (CRITICAL)

hackTime must feel energetic but NOT painful to look at.

### 17.1 Background Rules
- NEVER use pure black (#000000)
- Use softened dark:
  - #0F0F10
  - #121212
- Layer backgrounds for depth

### 17.2 Neon Usage Control

Neon colors are ACCENTS, not base colors.

DO:
- Use neon for:
  - highlights
  - buttons
  - key numbers
- Keep usage < 20% of screen

DON’T:
- Use neon for large text blocks
- Fill entire screens with neon
- Stack multiple neon colors together

### 17.3 Text Rules (VERY IMPORTANT)

- NEVER use pure white (#FFFFFF)
- Use:
  - #E6E6E6 (primary text)
  - #A0A0A0 (secondary)

- Avoid neon text on dark backgrounds
- Timer can be neon ONLY if large

### 17.4 Glow Rules

Glow should be subtle, not aggressive.

- Blur radius: low to medium
- Opacity: < 40%
- Only for:
  - timer
  - active CTA

### 17.5 Contrast Control

Maintain:
- 4.5:1 contrast minimum for text
- Avoid extreme contrast spikes

### 17.6 Saturation Balance

- Slightly desaturate neon colors for UI
- Keep original neon only for highlights

### 17.7 Visual Hierarchy Rule

Only ONE element should be visually loud:
→ the timer

Everything else must be quieter.

### 17.8 Eye Test Rule (LLM MUST FOLLOW)

Generated UI should pass:
- Comfortable for 10+ minutes viewing
- No “glowing overload”
- No text that vibrates visually

If it feels like a cyberpunk poster → TOO MUCH  
If it feels like a clean hacker dashboard → CORRECT

## 18. Design Tokens (STRICT)

### Colors

--color-bg-primary: #0F0F10  
--color-bg-card: #1C1C1C  
--color-bg-elevated: #232323  

--color-accent-fuchsia: #FF2E9A  
--color-accent-indigo: #5D00FF  
--color-accent-lime: #CFFF04  

--color-text-primary: #E6E6E6  
--color-text-secondary: #A0A0A0  
--color-text-muted: #6B7280  

---

### Gradients

--gradient-primary: linear-gradient(135deg, #5D00FF, #FF2E9A)

---

### Effects

--glow-fuchsia: 0 0 20px rgba(255, 46, 154, 0.35)  
--glow-indigo: 0 0 20px rgba(93, 0, 255, 0.35)  
--glow-lime: 0 0 20px rgba(207, 255, 4, 0.35)

---

### Radius

--radius-card: 20px  
--radius-pill: 999px  

---

### Spacing

--space-xs: 4px  
--space-sm: 8px  
--space-md: 16px  
--space-lg: 24px  
--space-xl: 32px