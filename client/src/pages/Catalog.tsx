import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Award, Sparkles, Gift, Box, Wrench } from "lucide-react";

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "awards-trophies": Award,
  "laser-engraving-materials": Sparkles,
  "gift-products": Gift,
  "display-cases": Box,
  "signage-tools": Wrench,
};

// Design level badge colors
const designLevelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-purple-100 text-purple-800",
};

const designLevelLabels: Record<string, string> = {
  low: "Stock Items",
  medium: "Personalization",
  high: "Full Custom Design",
};

export default function Catalog() {
  const { data: categories, isLoading } = trpc.catalog.getCategories.useQuery();
  const utils = trpc.useUtils();
  const seedMutation = trpc.catalog.seedCategories.useMutation({
    onSuccess: () => {
      utils.catalog.getCategories.invalidate();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-2xl font-bold text-primary hover:text-accent transition-colors">
              Studio 535
            </a>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/catalog">
              <a className="text-sm font-medium text-accent">Catalog</a>
            </Link>
            <Link href="/portfolio">
              <a className="text-sm font-medium hover:text-accent transition-colors">Portfolio</a>
            </Link>
            <Link href="/process">
              <a className="text-sm font-medium hover:text-accent transition-colors">Process</a>
            </Link>
            <Link href="/about">
              <a className="text-sm font-medium hover:text-accent transition-colors">About</a>
            </Link>
            <Link href="/request-quote">
              <Button variant="default" size="sm">Request Quote</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-24">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Product Catalog</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Browse our curated selection of over 6,000 products. From awards and trophies to laser engraving materials, 
            we offer everything you need with professional personalization and custom design services.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug] || Box;
              return (
                <Link key={category.id} href={`/catalog/${category.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-accent cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-accent" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${designLevelColors[category.designLevel]}`}>
                          {designLevelLabels[category.designLevel]}
                        </span>
                      </div>
                      <CardTitle className="text-xl mt-4 group-hover:text-accent transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          ~{category.productCount.toLocaleString()} products
                        </span>
                        {category.serviceType && (
                          <span className="text-accent font-medium">
                            {category.serviceType}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Catalog Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                We're currently setting up our product catalog. Check back soon or request a custom quote!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/request-quote">
                  <Button>Request a Quote</Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                >
                  {seedMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Initialize Catalog
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Service Tiers Explanation */}
        <div className="mt-16 bg-secondary/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Service Levels</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full mb-3 ${designLevelColors.low}`}>
                Stock Items
              </span>
              <h3 className="font-semibold mb-2">Ready to Ship</h3>
              <p className="text-sm text-muted-foreground">
                Display cases, tools, and accessories available for immediate purchase with minimal customization.
              </p>
            </div>
            <div className="text-center p-4">
              <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full mb-3 ${designLevelColors.medium}`}>
                Personalization
              </span>
              <h3 className="font-semibold mb-2">Add Your Touch</h3>
              <p className="text-sm text-muted-foreground">
                Awards, trophies, and gifts customized with names, dates, logos, and text using our design templates.
              </p>
            </div>
            <div className="text-center p-4">
              <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full mb-3 ${designLevelColors.high}`}>
                Full Custom Design
              </span>
              <h3 className="font-semibold mb-2">Bespoke Creations</h3>
              <p className="text-sm text-muted-foreground">
                Laser engraving materials transformed into unique pieces with our full design and fabrication services.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Something Custom?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Don't see exactly what you need? We specialize in custom projects. Tell us your vision!
          </p>
          <Link href="/request-quote">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              Request Custom Quote
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
