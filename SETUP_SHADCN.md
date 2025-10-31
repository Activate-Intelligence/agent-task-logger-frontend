# shadcn/ui Setup Guide

The project is pre-configured for shadcn/ui. Use the following commands to add components:

## Install shadcn/ui CLI

The CLI is available via npx, no installation needed.

## Add Components

### Basic UI Components

```bash
# Buttons
npx shadcn-ui@latest add button

# Cards
npx shadcn-ui@latest add card

# Dialogs/Modals
npx shadcn-ui@latest add dialog

# Dropdowns
npx shadcn-ui@latest add dropdown-menu

# Inputs
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select

# Labels
npx shadcn-ui@latest add label
```

### Form Components

```bash
# Complete form system
npx shadcn-ui@latest add form

# Date picker
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover

# Combobox (autocomplete)
npx shadcn-ui@latest add command
```

### Data Display

```bash
# Tables
npx shadcn-ui@latest add table

# Badges
npx shadcn-ui@latest add badge

# Tabs
npx shadcn-ui@latest add tabs

# Accordion
npx shadcn-ui@latest add accordion
```

### Feedback Components

```bash
# Toast notifications (already using sonner)
npx shadcn-ui@latest add toast

# Alert dialogs
npx shadcn-ui@latest add alert-dialog

# Alerts
npx shadcn-ui@latest add alert
```

### Navigation

```bash
# Navigation menu
npx shadcn-ui@latest add navigation-menu

# Breadcrumbs
npx shadcn-ui@latest add breadcrumb

# Pagination
npx shadcn-ui@latest add pagination
```

## Configuration

The project is configured with:

- **Style**: default
- **Base color**: slate
- **CSS variables**: enabled
- **TypeScript**: enabled
- **React Server Components**: disabled (static export)

Configuration file: `components.json`

## Component Location

All shadcn/ui components will be installed to:
```
src/components/ui/
```

## Usage Example

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  )
}
```

## Customization

Components can be customized by:

1. Editing the component files in `src/components/ui/`
2. Using the `cn()` utility function to merge classes
3. Using Tailwind classes directly
4. Modifying CSS variables in `src/app/globals.css`

## Recommended Components for Task Logger

```bash
# Essential components
npx shadcn-ui@latest add button card dialog form input label select textarea table badge tabs

# Optional but useful
npx shadcn-ui@latest add dropdown-menu command calendar popover alert-dialog separator
```

## Documentation

For full documentation, visit: https://ui.shadcn.com
