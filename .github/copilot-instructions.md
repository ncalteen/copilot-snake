# Copilot instructions for this repository

This is a web app deployed to GitHub Pages. The web app is a simple Snake game.
components.

## Overview

- All interfaces use `shadcn` primitives and `shadcn-styled` components.
- Next.js (App Router, v15)
- React 19
- TypeScript (strict mode in `tsconfig.json`).
- Tailwind CSS v4
  - Utility helper `cn()` is in `src/lib/utils.ts` (uses `clsx` +
    `tailwind-merge`).
- `shadcn-styled` components in `src/components/ui/*`
- Radix primitives
- `class-variance-authority` (CVA)
- `lucide-react`
- `sonner` for toasts
- `components.json` defines "new-york" style
- CSS variables enabled
- Aliases configured (`@/components/ui`, `@/lib/utils`, etc.)
- Scripts in `package.json` use Turbopack flags (`next dev --turbopack`)
- Linting via `eslint` (`npm run lint`).

## Repository Structure

- `src/app/` is the App Router root
- Small hooks and helpers live in `src/hooks/` and `src/lib/` (e.g.
  `use-mobile.ts`, `utils.ts`).

## Key Conventions and Patterns

Always follow the below patterns.

- Component files
  - `PascalCase` filenames and default/named exports
  - Co-locate UI components in `src/components/ui/`.
- Variant styling
  - Use CVA (`cva`) for variant definitions and `cn()` (from `src/lib/utils.ts`)
    to merge classes.
- **All components are client-side to support deployment to GitHub Pages**
  - Client-only components include a top-line `"use client"` (see
    `src/components/ui/dialog.tsx`).
- Imports
  - Use `@/` alias for internal modules (e.g.
    `import { cn } from '@/lib/utils'`).

## Integration Points & Notable Dependencies

- Radix UI primitives under `@radix-ui/*` used extensively
  - Wrap them rather than re-implementing primitives.
- `class-variance-authority` + `tailwind-merge` drive the styling system
  - Prefer these for new components.
- Component generation
  - `.github/prompts/shadcn-component-generator.prompt.md` contains expert
    patterns for creating new `shadcn`-style components.
- Adding components
  - Use `npx shadcn-ui@latest add <component>` or follow the established
    patterns in existing components.

## Where to Look First (Examples)

- `src/components/ui/button.tsx`
- `src/lib/utils.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `components.json`
- `.github/instructions/*`
- `.github/prompts/shadcn-component-generator.prompt.md`

## Checklist Before Creating a Pull Request

- Check and fix formatting (`npm run format:write`).
- Check and fix linting errors (`npm run lint`).
- Build locally and fix TypeScript errors (`npm run build`).

If anything in this document is unclear or you want more detail (examples for
patterns, tests, or CI instructions), tell me which section to expand or
correct.
