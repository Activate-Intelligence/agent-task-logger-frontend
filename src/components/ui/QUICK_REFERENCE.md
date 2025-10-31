# shadcn/ui Components Quick Reference

## Most Common Components for Task Logger

### 1. Forms & Inputs

#### Basic Form
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().min(2),
})

export function MyForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### 2. Data Display

#### Card Container
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Task Details</CardTitle>
    <CardDescription>View and edit task information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

#### Table
```tsx
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Task</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Complete report</TableCell>
      <TableCell>Done</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 3. Dialogs & Modals

#### Dialog
```tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

<Dialog>
  <DialogTrigger asChild>
    <Button>Create Task</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Task</DialogTitle>
    </DialogHeader>
    {/* Form here */}
  </DialogContent>
</Dialog>
```

#### Sheet (Sidebar)
```tsx
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Filters</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filter Tasks</SheetTitle>
    </SheetHeader>
    {/* Filters here */}
  </SheetContent>
</Sheet>
```

### 4. Feedback

#### Toast Notifications
```tsx
"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function Example() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Task Created",
          description: "Your task has been successfully created.",
        })
      }}
    >
      Show Toast
    </Button>
  )
}
```

#### Loading Skeleton
```tsx
import { Skeleton } from "@/components/ui/skeleton"

<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

#### Alert
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

### 5. Date Pickers

#### Single Date
```tsx
"use client"

import { DatePicker } from "@/components/ui/date-picker"
import { useState } from "react"

export function Example() {
  const [date, setDate] = useState<Date>()

  return <DatePicker date={date} onDateChange={setDate} />
}
```

#### Date Range
```tsx
"use client"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useState } from "react"
import { DateRange } from "react-day-picker"

export function Example() {
  const [dateRange, setDateRange] = useState<DateRange>()

  return <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
}
```

### 6. Dropdowns & Selects

#### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="in_progress">In Progress</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
  </SelectContent>
</Select>
```

#### Dropdown Menu
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 7. Navigation

#### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="tasks">
  <TabsList>
    <TabsTrigger value="tasks">Tasks</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="tasks">
    {/* Tasks content */}
  </TabsContent>
  <TabsContent value="reports">
    {/* Reports content */}
  </TabsContent>
</Tabs>
```

### 8. Utilities

#### Badge
```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Completed</Badge>
<Badge variant="destructive">Urgent</Badge>
<Badge variant="outline">Pending</Badge>
```

#### Tooltip
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Helpful information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Separator
```tsx
import { Separator } from "@/components/ui/separator"

<div>
  <p>Section 1</p>
  <Separator />
  <p>Section 2</p>
</div>
```

## Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Button Sizes

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

## Common Patterns

### Form with Date Picker
```tsx
<FormField
  control={form.control}
  name="taskDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Task Date</FormLabel>
      <FormControl>
        <DatePicker
          date={field.value}
          onDateChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Loading State
```tsx
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <Table>
    {/* Table content */}
  </Table>
)}
```

### Error Alert
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

## Pro Tips

1. **Always use "use client" directive** for components with interactivity (forms, dialogs, etc.)
2. **Wrap forms with Form component** from shadcn/ui for proper styling
3. **Use TooltipProvider at app level** for better performance
4. **Combine with lucide-react icons** for consistent iconography
5. **Use cn() utility** from @/lib/utils to merge Tailwind classes
6. **Prefer variant props** over custom styling when possible
7. **Use asChild prop** to compose components without wrapper divs

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Schema Validation](https://zod.dev)
