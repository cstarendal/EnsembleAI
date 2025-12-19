# CSS Structure & Styling Guide

This guide explains how CSS is structured and how to work with styling in the Ensemble AI project.

## Core Principles

1. **Design Tokens First** - Never hardcode values, always use tokens
2. **Tailwind Preferred** - Use Tailwind classes when possible
3. **CSS Variables for Theming** - All colors/spacing use CSS variables
4. **Dark Mode Built-in** - All tokens support dark mode automatically
5. **Component-Scoped Styles** - Keep styles close to components when needed

---

## File Structure

```
frontend/src/
  styles/
    design-tokens.css    # CSS variables (colors, spacing, etc.)
    index.css           # Main entry point (imports tokens + Tailwind)
    components/         # Component-specific CSS (if needed)
      debate-timeline.css
      source-panel.css
```

**Rule:** Most styling should be done with Tailwind classes. Only use separate CSS files for:
- Complex animations
- Component-specific styles that are hard to express in Tailwind
- Third-party component overrides

---

## Design Tokens System

### Token Categories

All tokens are defined in `src/styles/design-tokens.css`:

1. **Colors** - Semantic color palette (HSL format)
2. **Spacing** - Consistent spacing scale
3. **Typography** - Font families and sizes
4. **Border Radius** - Consistent rounding
5. **Shadows** - Elevation system
6. **Transitions** - Animation timing

### Color System

Colors use HSL format in CSS variables (without `hsl()` wrapper):

```css
--background: 0 0% 100%;  /* Light mode: white */
```

In dark mode:
```css
.dark {
  --background: 222.2 84% 4.9%;  /* Dark mode: dark blue */
}
```

**Why HSL?** Allows easy manipulation (lightness, saturation) and works with Tailwind's `hsl()` function.

---

## Using Design Tokens

### Method 1: Tailwind Classes (Preferred)

Tailwind is configured to use design tokens. Use semantic class names:

```tsx
// ✅ Good - Uses design tokens via Tailwind
<div className="p-lg bg-card text-foreground rounded-lg shadow-card">
  <h2 className="text-xl font-semibold text-primary">Title</h2>
</div>
```

### Method 2: CSS Variables (When Needed)

For complex styles or when Tailwind doesn't have a class:

```tsx
// ✅ Good - Uses CSS variables directly
<div 
  className="my-component"
  style={{
    padding: 'var(--space-lg)',
    background: 'hsl(var(--card))',
    boxShadow: 'var(--shadow-card)'
  }}
>
```

Or in a CSS file:

```css
.my-component {
  padding: var(--space-lg);
  background: hsl(var(--card));
  box-shadow: var(--shadow-card);
  transition: var(--transition-smooth);
}
```

### Method 3: Tailwind with CSS Variables

For values not in Tailwind config:

```tsx
// ✅ Good - Tailwind + CSS variable
<div className="p-4 rounded-[var(--radius-lg)]">
```

---

## Tailwind Configuration

Tailwind is configured to use design tokens. The config maps CSS variables to Tailwind utilities:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      card: 'hsl(var(--card))',
      // ... etc
    },
    spacing: {
      xs: 'var(--space-xs)',
      sm: 'var(--space-sm)',
      md: 'var(--space-md)',
      lg: 'var(--space-lg)',
      // ... etc
    }
  }
}
```

This allows you to use:
- `bg-card` instead of `bg-[hsl(var(--card))]`
- `p-lg` instead of `p-[var(--space-lg)]`

---

## Spacing Scale

Use the spacing scale consistently:

```tsx
// ✅ Good - Uses spacing tokens
<div className="p-lg m-md gap-sm">
<div className="px-xl py-md">
<div className="space-y-lg">

// ❌ Bad - Hardcoded values
<div className="p-6 m-4 gap-2">
```

**Available spacing:**
- `xs` = 0.25rem (4px)
- `sm` = 0.5rem (8px)
- `md` = 1rem (16px)
- `lg` = 1.5rem (24px)
- `xl` = 2rem (32px)
- `2xl` = 3rem (48px)
- `3xl` = 4rem (64px)
- `4xl` = 6rem (96px)

---

## Color Usage

### Semantic Colors

Use semantic color names, not raw colors:

```tsx
// ✅ Good - Semantic colors
<div className="bg-card text-foreground">
<button className="bg-primary text-primary-foreground">
<div className="border-border">

// ❌ Bad - Raw colors
<div className="bg-white text-black">
<button className="bg-blue-500 text-white">
```

**Available semantic colors:**
- `background` / `foreground` - Base colors
- `card` / `card-foreground` - Card backgrounds
- `primary` / `primary-foreground` - Primary actions
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Muted/de-emphasized
- `accent` / `accent-foreground` - Accent highlights
- `destructive` / `destructive-foreground` - Errors/destructive actions
- `border` - Borders
- `input` - Input fields
- `ring` - Focus rings

---

## Dark Mode

Dark mode is automatic via `.dark` class on root element:

```tsx
// No special classes needed - tokens handle it
<div className="bg-card text-foreground">
  {/* Automatically uses dark mode colors when .dark class is present */}
</div>
```

**Implementation:**
- Add/remove `.dark` class on `<html>` or root element
- All tokens automatically switch
- No need for `dark:` prefixes in most cases

---

## Shadows & Elevation

Use shadow tokens for consistent elevation:

```tsx
// ✅ Good - Uses shadow tokens
<div className="shadow-card">      {/* Subtle card shadow */}
<div className="shadow-md">        {/* Medium elevation */}
<div className="shadow-lg">        {/* High elevation */}

// ❌ Bad - Hardcoded shadows
<div style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
```

---

## Transitions

Use transition tokens for consistent animations:

```tsx
// ✅ Good - Uses transition tokens
<div className="transition-all duration-fast">
<button className="transition-colors duration-smooth">

// Or in CSS:
.my-component {
  transition: var(--transition-smooth);
}
```

**Available transitions:**
- `fast` = 150ms ease
- `smooth` = 300ms ease
- `bounce` = 500ms cubic-bezier

---

## Responsive Design

Use Tailwind's responsive utilities:

```tsx
// ✅ Good - Responsive with tokens
<div className="p-md md:p-lg lg:p-xl">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">

// ❌ Bad - Fixed sizes
<div className="p-4">
```

---

## Component-Specific Styles

### When to Use Separate CSS Files

Only use separate CSS files for:
1. **Complex animations** that are hard in Tailwind
2. **Third-party component overrides**
3. **Complex selectors** (e.g., `:has()`, `:nth-child()` patterns)

### Pattern

```tsx
// Component file
import './debate-timeline.css';

export function DebateTimeline() {
  return <div className="debate-timeline">...</div>;
}
```

```css
/* debate-timeline.css */
.debate-timeline {
  /* Use design tokens */
  padding: var(--space-lg);
  background: hsl(var(--card));
}

/* Complex animation */
@keyframes slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.debate-timeline-item {
  animation: slide-in var(--transition-smooth);
}
```

---

## Best Practices

### ✅ DO

1. **Use Tailwind classes** for most styling
2. **Use design tokens** via Tailwind or CSS variables
3. **Use semantic color names** (`bg-card`, not `bg-white`)
4. **Use spacing scale** (`p-lg`, not `p-6`)
5. **Keep styles close to components** (inline or co-located CSS)
6. **Use responsive utilities** (`md:p-lg`, `lg:grid-cols-3`)

### ❌ DON'T

1. **Don't hardcode values** (`p-4`, `bg-white`, `#ff0000`)
2. **Don't use inline styles** for token values (use Tailwind or CSS variables)
3. **Don't create global CSS** for component-specific styles
4. **Don't use arbitrary values** when tokens exist (`p-[24px]` → use `p-lg`)
5. **Don't mix approaches** (stick to Tailwind or CSS variables, be consistent)

---

## Examples

### Card Component

```tsx
// ✅ Good
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-lg bg-card text-card-foreground rounded-lg shadow-card border border-border">
      {children}
    </div>
  );
}
```

### Button Component

```tsx
// ✅ Good
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-lg py-md bg-primary text-primary-foreground rounded-md shadow-sm hover:shadow-md transition-all duration-fast">
      {children}
    </button>
  );
}
```

### Responsive Layout

```tsx
// ✅ Good
export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto p-md md:p-lg lg:p-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-lg">
        {children}
      </div>
    </div>
  );
}
```

### Complex Animation (CSS File)

```tsx
// debate-message.tsx
import './debate-message.css';

export function DebateMessage() {
  return <div className="debate-message">...</div>;
}
```

```css
/* debate-message.css */
.debate-message {
  padding: var(--space-lg);
  background: hsl(var(--card));
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  transition: var(--transition-smooth);
}

.debate-message:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

---

## Validation

### Design Token Checker

Run the design token validation script:

```bash
npm run lint:design-tokens
```

This checks for:
- Hardcoded color values (`#fff`, `rgb()`, `rgba()`)
- Hardcoded spacing values (`px`, `rem` without tokens)
- Hardcoded shadows
- Missing token usage

### Manual Checklist

Before committing, check:
- [ ] No hardcoded colors (use semantic tokens)
- [ ] No hardcoded spacing (use spacing scale)
- [ ] No hardcoded shadows (use shadow tokens)
- [ ] Responsive design uses Tailwind utilities
- [ ] Dark mode works (test with `.dark` class)

---

## Adding New Tokens

### Process

1. **Add to `design-tokens.css`**:
   ```css
   :root {
     --new-token: value;
   }
   
   .dark {
     --new-token: dark-value;
   }
   ```

2. **Add to `tailwind.config.js`** (if needed):
   ```js
   theme: {
     extend: {
       colors: {
         'new-color': 'hsl(var(--new-token))',
       }
     }
   }
   ```

3. **Update this guide** with new token

4. **Test in both light and dark mode**

---

## Troubleshooting

### Colors Not Working

- Check that colors use `hsl(var(--token))` format
- Verify token exists in `design-tokens.css`
- Check Tailwind config includes the color

### Dark Mode Not Working

- Verify `.dark` class is on root element
- Check token has dark mode variant in `.dark` selector
- Ensure using semantic colors, not hardcoded values

### Spacing Not Consistent

- Use spacing scale (`p-lg`, not `p-6`)
- Check Tailwind config maps spacing tokens
- Verify token exists in `design-tokens.css`

---

## Summary

1. **Design tokens are the source of truth** - defined in `design-tokens.css`
2. **Tailwind is the preferred way** to use tokens (via config)
3. **CSS variables for complex cases** or when Tailwind doesn't fit
4. **Never hardcode values** - always use tokens
5. **Dark mode is automatic** - tokens handle it
6. **Validate before committing** - run `npm run lint:design-tokens`

---

**Remember:** If you find yourself hardcoding a value, stop and ask: "Is there a design token for this?" If not, consider adding one!

