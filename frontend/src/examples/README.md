# 📚 SwapHubu Frontend Examples

This folder contains comprehensive documentation and examples for all the components, patterns, and systems built for the SwapHubu trading platform frontend.

## 🎯 What's Included

### 🌙 Theme System

- **File**: `theme-examples.tsx`
- **Components**: `ThemeProvider`, `ThemeToggle`, `useTheme`
- **Features**: Dark/light mode, system preference, persistent state

### 📋 Metadata System

- **File**: `metadata-examples.tsx`
- **Utility**: `generateMetadata`
- **Features**: SEO optimization, Open Graph, Twitter Cards

### ✨ Animation System

- **File**: `animation-examples.tsx`
- **Components**: `Animated`, `FadeIn`, `SlideUp`, `AnimatedCard`
- **Features**: Framer Motion integration, pre-built variants

### 🏗️ Layout System

- **File**: `layout-examples.tsx`
- **Components**: `MainLayout`, `Header`
- **Features**: Responsive design, consistent spacing

## 🚀 Quick Access

### View All Examples

```tsx
// Navigate to /examples in your app
import ExamplesIndex from "@/examples";
```

### Use Individual Components

```tsx
// Theme
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

// Metadata
import { generateMetadata } from "@/lib/metadata";

// Animations
import { SlideUp, AnimatedCard } from "@/components/ui/animated";

// Layout
import { MainLayout } from "@/components/layout/main-layout";
```

## 📖 Documentation Structure

Each example file follows this structure:

1. **Header Comment** - Explains what the file demonstrates
2. **Basic Usage** - Simple examples to get started
3. **Advanced Patterns** - Complex use cases
4. **Real World Examples** - Production-ready implementations
5. **Best Practices** - Do's and don'ts
6. **Props/API Reference** - Available options

## 🎨 File Organization

```
examples/
├── README.md                 # This file
├── index.tsx                 # Main examples showcase
├── theme-examples.tsx        # Theme system docs
├── metadata-examples.tsx     # Metadata system docs
├── animation-examples.tsx    # Animation system docs
└── layout-examples.tsx       # Layout system docs
```

## ⚡ Quick Start Templates

### New Page Template

```tsx
import { MainLayout } from "@/components/layout/main-layout";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Your Page",
  description: "Page description",
});

export default function YourPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1>Page Title</h1>
        <p className="text-muted-foreground">Page content</p>
      </div>
    </MainLayout>
  );
}
```

### Component Template

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { SlideUp } from "@/components/ui/animated";

export function YourComponent() {
  return (
    <SlideUp>
      <Card>
        <CardContent className="p-6">
          <h3>Component Title</h3>
          <p className="text-muted-foreground">Component description</p>
        </CardContent>
      </Card>
    </SlideUp>
  );
}
```

## 🛠️ Development Tips

### Testing Your Components

1. Add them to the examples showcase
2. Test in both light and dark themes
3. Check responsive behavior on mobile
4. Verify animations work smoothly

### Best Practices

- Use semantic HTML elements (h1, h2, p, etc.) for text
- Wrap pages in `MainLayout`
- Add metadata for SEO
- Use animations sparingly for better performance
- Follow the spacing system for consistency

## 📱 Responsive Design

All examples are built with mobile-first responsive design:

- **Mobile**: `< 768px` - Single column, stacked layout
- **Tablet**: `768px - 1024px` - Two column layouts
- **Desktop**: `> 1024px` - Multi-column, full features

## 🎯 Component Philosophy

Our components follow these principles:

1. **Consistency** - Uniform look and behavior
2. **Accessibility** - Semantic HTML and ARIA support
3. **Performance** - Optimized for speed
4. **Developer Experience** - Easy to use and understand
5. **Customization** - Flexible and themeable

---

**Happy coding!** 🚀

For questions or improvements, update the examples and share with the team.
