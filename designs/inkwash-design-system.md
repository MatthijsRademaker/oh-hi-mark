# OHM Inkwash design system

Source reference: `design-system.png`. Dashboard composition reference: `ohm-inkwash-dashboard.png`.

## Principles

1. **Response first.** Decoration frames reading surfaces; it never reduces legibility or input access.
2. **Ink hierarchy.** Contrast, density, and line weight establish hierarchy before color.
3. **No bordered surfaces.** A surface is separated from the painting by pigment density thinning out at its edge, never by a stroke, a uniform fill boundary, or a blurred backdrop. Focus rings are the sole exception: they must stay unambiguous.
4. **Warm paper.** Surfaces use warm neutral layers instead of pure white.
5. **Restrained seal red.** Red marks identity and emphasis, not generic status.
6. **Local and resilient.** No remote fonts, images, or icon assets.

## Foundation

### Palette

| Token | Value | Use |
| --- | ---: | --- |
| Ink | `#0d0d0d` | Primary text and actions |
| Dark gray | `#1e1e1e` | Header and raised dark surfaces |
| Gray | `#4b4b4b` | Secondary text |
| Stone | `#a7a7a7` | Quiet borders and metadata |
| Paper | `#f6f3ee` | Page background |
| Ink wash | `#e6e1da` | Panels and atmosphere |
| Seal red | `#b23a2e` | Brand seals and sparse accents |

Runtime CSS exposes semantic shadcn-compatible aliases (`background`, `foreground`, `card`, `muted`, `border`, `primary`, `destructive`, and focus `ring`) plus raw `--ohm-*` design tokens. Dark mode remaps semantic aliases while retaining warm neutral character.

### Typography

- **Display:** local Kai/handwritten system fallbacks for sparse editorial headings.
- **Editorial serif:** local CJK serif/system serif stack for headings and long-form response prose.
- **Interface sans:** packaged Geist Variable for controls, labels, and metadata.
- **Code:** local UI monospace stack.

Use uppercase sans labels with wide tracking for metadata. Keep body measure near 70 characters and line height near 1.8.

### Spacing and shape

- Base spacing steps: `4, 8, 12, 16, 24, 32, 64px`.
- Controls use compact 32–36px heights.
- Panels and controls use square corners; feathered ink edges provide softness instead of rounded UI chrome.
- Panels carry no border. Depth comes from veil density and edge falloff.

## Components

- **Brand mark:** open ink circle, serif OHM wordmark, seal-red stamp.
- **Brush button:** vermilion stroke with paper text, tapered at both ends, clear focus ring. Vermilion rather than ink so one token carries the primary action on both paper and ink grounds.
- **Ghost/outline control:** transparent dark-header control with paper border and text.
- **Panel (`.ohm-wash`):** translucent veil on a bleeding pseudo-element, edge feathered by a bundled noise mask. No border, no corner marks, no backdrop blur.
- **Field:** pigment pooled at the writing line under a tapered ink rule, no border or edge. Focus turns the rule seal red and adds a 3px ring.
- **Code slab (`.ohm-slab`):** warm ink ground with the repo-local `ohm-ink` Shiki themes, edges faded by an even px-accurate mask, horizontal overflow preserved.
- **Blockquote:** tapered seal-red downstroke over a tighter-bleed `.ohm-wash` ground, so quoted text stays readable against the painting. No box or border.
- **Divider:** fine ink rule with small brush beads.
- **Landscape:** bundled theme-specific PNG artwork, switched by semantic theme state and fixed behind content.

## Responsive and access rules

- Desktop: response and scratchpad form `minmax(0, 1fr) / 22rem` grid.
- Below 1024px: scratchpad stacks after response and loses sticky positioning.
- Below 640px: header wraps, decorative art fades, controls remain named and reachable.
- Focus uses visible 3px ring. Reduced motion disables smooth scroll and transitions.
- Landscape, seals, and calligraphic labels never carry unique meaning.
- Markdown images remain inert placeholders; decorative system art ships inside app bundle.
