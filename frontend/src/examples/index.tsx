/**
 * SWAPHUBU EXAMPLES INDEX
 *
 * This file serves as a comprehensive showcase of all the components and patterns
 * built for the SwapHubu frontend application.
 *
 * Navigate through different sections to see implementation examples and best practices.
 */

"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all example components
import { AnimationExamples } from "./animation-examples";

export default function ExamplesIndex() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">SwapHubu Frontend Examples</h1>
          <p className="max-w-3xl mx-auto">
            Comprehensive documentation and examples for all the components,
            patterns, and systems built for the SwapHubu trading platform.
          </p>
        </div>

        {/* Quick Overview */}
        <section className="mb-12">
          <h2 className="mb-6">🚀 What&apos;s Included</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🌙</span> Theme System
                </CardTitle>
                <CardDescription>
                  Dark/light mode with smooth transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• ThemeProvider setup</li>
                  <li>• Theme toggle component</li>
                  <li>• CSS variables system</li>
                  <li>• Theme-aware components</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📋</span> Metadata System
                </CardTitle>
                <CardDescription>
                  SEO optimization and social media previews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Dynamic page titles</li>
                  <li>• Meta descriptions</li>
                  <li>• Open Graph tags</li>
                  <li>• Twitter Card support</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>✨</span> Animation System
                </CardTitle>
                <CardDescription>
                  Smooth Framer Motion animations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Pre-built animation variants</li>
                  <li>• Easy-to-use components</li>
                  <li>• Staggered animations</li>
                  <li>• Hover effects</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏗️</span> Layout System
                </CardTitle>
                <CardDescription>
                  Responsive layouts and components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• MainLayout wrapper</li>
                  <li>• Header with navigation</li>
                  <li>• Responsive patterns</li>
                  <li>• Spacing system</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🧩</span> UI Components
                </CardTitle>
                <CardDescription>shadcn/ui component library</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Button, Card, Input</li>
                  <li>• Dialog, Sheet, Badge</li>
                  <li>• Consistent styling</li>
                  <li>• TypeScript support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Examples */}
        <section>
          <h2 className="mb-6">📚 Interactive Examples</h2>

          <Tabs defaultValue="animations" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-8">
              <TabsTrigger value="animations">Animations</TabsTrigger>
            </TabsList>

            <TabsContent value="animations">
              <AnimationExamples />
            </TabsContent>
          </Tabs>
        </section>

        {/* Quick Start Guide */}
        <section className="mt-16">
          <h2 className="mb-6">⚡ Quick Start Guide</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>🎯 For New Pages</CardTitle>
                <CardDescription>
                  Essential steps when creating a new page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p>1. Import the layout and metadata utility</p>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs">
                    {`import { MainLayout } from "@/components/layout/main-layout";
import { generateMetadata } from "@/lib/metadata";`}
                  </pre>
                </div>

                <div>
                  <p>2. Export metadata for the page</p>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs">
                    {`export const metadata = generateMetadata({
  title: "Your Page Title",
  description: "Page description for SEO"
});`}
                  </pre>
                </div>

                <div>
                  <p>3. Wrap content in MainLayout</p>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs">
                    {`export default function YourPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Your content here */}
      </div>
    </MainLayout>
  );
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 For Components</CardTitle>
                <CardDescription>
                  Best practices when building components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p>Add animations for better UX</p>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs">
                    {`import { SlideUp, AnimatedCard } from "@/components/ui/animated";

<SlideUp delay={0.1}>
  <AnimatedCard>
    <Card>Interactive content</Card>
  </AnimatedCard>
</SlideUp>`}
                  </pre>
                </div>

                <div>
                  <p>Follow the spacing system</p>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs">
                    {`// Consistent spacing patterns
<div className="space-y-6">      {/* Vertical spacing */}
  <div className="grid gap-4">   {/* Grid gaps */}
    <div className="p-4">        {/* Padding */}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center">
          <p>
            Built with ❤️ for the SwapHubu trading platform. All components are
            ready for production use.
          </p>
        </footer>
      </div>
    </MainLayout>
  );
}
