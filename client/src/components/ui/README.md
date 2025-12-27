# UI Components Library

This folder contains reusable UI components for the ApexDevs project. These components provide a consistent design system across the application.

## Components

### Tag

A reusable tag/badge component for displaying technologies, categories, or labels.

**Props:**
- `children` (required): The tag text content
- `variant` (optional): Style variant - `'primary'` | `'secondary'` | `'outline'` | `'success'` | `'warning'` | `'danger'`
  - Default: `'primary'`
- `size` (optional): Size variant - `'xs'` | `'sm'` | `'md'` | `'lg'`
  - Default: `'sm'`
- `onRemove` (optional): Callback function for removable tags (shows X button when provided)
- `className` (optional): Additional custom CSS classes

**Usage Examples:**

```jsx
import { Tag } from '../components/ui';

// Basic tag
<Tag>React</Tag>

// Primary tag with medium size
<Tag variant="primary" size="md">JavaScript</Tag>

// Removable tag
<Tag 
  variant="primary" 
  onRemove={() => handleRemove(tagId)}
>
  TypeScript
</Tag>

// Secondary tag
<Tag variant="secondary">In Progress</Tag>

// Success tag
<Tag variant="success">Completed</Tag>
```

### Button

A versatile button component with multiple variants, sizes, and states. Can render as a button, Link (React Router), or anchor tag.

**Props:**
- `children` (required): Button content
- `variant` (optional): Style variant - `'primary'` | `'secondary'` | `'outline'` | `'ghost'` | `'danger'` | `'success'`
  - Default: `'primary'`
- `size` (optional): Size variant - `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'`
  - Default: `'md'`
- `fullWidth` (optional): Whether button should take full width
  - Default: `false`
- `disabled` (optional): Disabled state
  - Default: `false`
- `loading` (optional): Loading state (shows spinner)
  - Default: `false`
- `type` (optional): Button type - `'button'` | `'submit'` | `'reset'`
  - Default: `'button'`
- `to` (optional): If provided, renders as React Router Link
- `href` (optional): If provided, renders as anchor tag
- `onClick` (optional): Click handler function
- `icon` (optional): Icon element to display before text
- `iconRight` (optional): Icon element to display after text
- `className` (optional): Additional custom CSS classes

**Usage Examples:**

```jsx
import { Button } from '../components/ui';

// Primary button
<Button onClick={handleClick}>Click Me</Button>

// Button as Link (React Router)
<Button to="/profile" variant="primary">
  View Profile
</Button>

// Button as external link
<Button href="https://github.com" variant="secondary">
  GitHub
</Button>

// Button with icon
<Button 
  variant="primary" 
  icon={<PlusIcon />}
  onClick={handleAdd}
>
  Add Project
</Button>

// Loading button
<Button loading={isSubmitting} type="submit">
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>

// Full width button
<Button fullWidth variant="primary">
  Sign Up
</Button>

// Large danger button
<Button size="lg" variant="danger" onClick={handleDelete}>
  Delete Account
</Button>

// Outline ghost button
<Button variant="outline">Cancel</Button>
```

## Design Tokens

### Colors
- **Primary**: `#00C896` (Brand green)
- **Primary Light**: `#00E0A8` (Hover state)
- **Neutral-900**: `#171717` (Background)
- **Neutral-800**: `#262626` (Cards, navbar)
- **Neutral-700**: `#404040` (Inputs, secondary elements)
- **Neutral-600**: `#525252` (Borders)

### Variants

**Tag Variants:**
- `primary`: Green tint with primary color
- `secondary`: Gray neutral background
- `outline`: Transparent with border
- `success`: Green for success states
- `warning`: Yellow for warnings
- `danger`: Red for errors/destructive actions

**Button Variants:**
- `primary`: Solid primary color with dark text
- `secondary`: Gray background with light text
- `outline`: Transparent with border, hover effects
- `ghost`: Minimal styling, hover background
- `danger`: Red for destructive actions
- `success`: Green for success actions

### Sizes

**Tag Sizes:**
- `xs`: Extra small (2px padding, xs text)
- `sm`: Small (2px padding, xs text) - default
- `md`: Medium (3px padding, sm text)
- `lg`: Large (4px padding, base text)

**Button Sizes:**
- `xs`: Extra small
- `sm`: Small
- `md`: Medium - default
- `lg`: Large
- `xl`: Extra large

## Best Practices

1. **Consistency**: Always use these components instead of creating inline buttons or tags
2. **Accessibility**: Components include proper ARIA attributes and keyboard support
3. **Responsiveness**: All components are mobile-friendly
4. **Theming**: Stay within the defined variants rather than adding custom colors
5. **Loading States**: Use the `loading` prop on buttons for async operations

## Adding New Components

When adding new reusable UI components:

1. Create the component file in `/components/ui/`
2. Add PropTypes for type checking
3. Include comprehensive JSDoc comments
4. Export from `/components/ui/index.js`
5. Update this README with usage examples
6. Follow the established design patterns

## Migration Guide

If you're updating existing code to use these components:

**Before:**
```jsx
<span className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-xs">
  React
</span>
```

**After:**
```jsx
<Tag variant="primary" size="sm">React</Tag>
```

**Before:**
```jsx
<button className="px-4 py-2 bg-primary hover:bg-primary-light text-neutral-900 rounded-lg">
  Submit
</button>
```

**After:**
```jsx
<Button variant="primary" size="md">Submit</Button>
```
