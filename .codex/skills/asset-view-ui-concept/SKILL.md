---
name: asset-view-ui-concept
description: Apply the agreed TesterClient asset detail UI concept to Vue 2 asset screens in src/views/AssetView, especially when redesigning equipment views such as Bushing, Transformer, CircuitBreaker, or similar assets with properties, comments, name plate, attachments, ratings, tables, and responsive behavior.
---

# Asset View UI Concept

Use this skill when changing asset detail screens under `src/views/AssetView`.

## Core Layout

- Build the usable asset view directly, not explanatory UI.
- Use compact card panels with 6px radius, `#e4e7ed` borders, `#f5f7fa` headers, white bodies, 12px text, and restrained spacing.
- Match the practical Job UI feel: dense, readable, work-focused, and predictable.
- Avoid nested cards. Cards are for panels, media blocks, repeated items, and tables.

## Responsive Rule

- Prefer container-responsive CSS over viewport-only media queries.
- Use `grid-template-columns: repeat(auto-fit, minmax(min(100%, Npx), 1fr))` for paired panels.
- Use `flex-wrap` for toolbar/tab rows.
- This project often narrows the center asset panel while the full viewport remains desktop-sized; `md`/`lg` breakpoints alone are not enough.

## Properties, Comment, Name Plate, Attachments

- First row: `Properties` and `Comment` as balanced cards.
- Second row: `Name plate` and `Attachments` as balanced cards.
- Name plate is image-only and should display the image directly, not behave like a normal attachment list.
- Keep Name plate and Attachments visually equal height on desktop; stack naturally when the container narrows.
- Separate the nameplate attachment from normal attachments by marking it with `role: 'nameplate'`.

## Forms

- Labels and controls must not overflow their card.
- For narrow containers, stack labels above controls when needed.
- Inputs with appended units/selects need explicit min-widths so the value area remains readable.
- Unit append/select areas should be narrow and stable; do not let unit selectors consume the value input.
- Use concise labels in cramped layouts, for example `Unsupported vector`, `Select`, `Clear`.

## Tables

- Table-heavy sections should scroll horizontally inside their card.
- Do not compress numeric value columns until they are unreadable.
- Give important value columns stable widths, especially `Base power`, `Base voltage`, `Ref. temp`, `Rated frequency`, `Max short-circuit current`, and zero-sequence values.
- Keep delete buttons compact icon controls inside tables.

## Toolbar Buttons

- Add/Clear style toolbar buttons should be fit-content width.
- Keep related buttons close together with flex gap.
- Do not use two 50% columns for short buttons.

## Verification

- Run targeted ESLint on every Vue file touched.
- Full repo lint may fail because of unrelated legacy errors; report that separately if run.
