import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

export default function Portfolio() {
  const { data: portfolioItems, isLoading } = trpc.portfolio.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // Extract unique categories and materials for filtering
  const { categories, materials } = useMemo(() => {
    if (!portfolioItems) return { categories: [], materials: [] };

    const categoriesSet = new Set<string>();
    const materialsSet = new Set<string>();

    portfolioItems.forEach(item => {
      if (item.category) categoriesSet.add(item.category);
      if (item.material) materialsSet.add(item.material);
    });

    return {
      categories: Array.from(categoriesSet).sort(),
      materials: Array.from(materialsSet).sort(),
    };
  }, [portfolioItems]);

  // Filter portfolio items
  const filteredItems = useMemo(() => {
    if (!portfolioItems) return [];

    return portfolioItems.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedMaterial && item.material !== selectedMaterial) return false;
      return true;
    });
  }, [portfolioItems, selectedCategory, selectedMaterial]);

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
            <Link href="/portfolio">
              <a className="text-sm font-medium text-accent">Portfolio</a>
            </Link>
            <Link href="/process">
              <a className="text-sm font-medium hover:text-accent transition-colors">Process</a>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Portfolio</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of bespoke designs and custom fabrication projects. Each piece tells a unique story of craftsmanship and creativity.
          </p>
        </div>

        {/* Filters */}
        {!isLoading && portfolioItems && portfolioItems.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Material Filter */}
            {materials.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Filter by Material</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedMaterial === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedMaterial(null)}
                  >
                    All
                  </Badge>
                  {materials.map((material) => (
                    <Badge
                      key={material}
                      variant={selectedMaterial === material ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {portfolioItems.length} projects
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <Link href={`/portfolio/${item.id}`}>
                  <a>
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.featured === 1 && (
                        <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <div className="flex gap-2 mb-2">
                        {item.category && (
                          <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                        )}
                        {item.material && (
                          <Badge variant="outline" className="text-xs">{item.material}</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </CardContent>
                  </a>
                </Link>
              </Card>
            ))}
          </div>
        ) : portfolioItems && portfolioItems.length > 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to see more projects.
              </p>
              <Button onClick={() => {
                setSelectedCategory(null);
                setSelectedMaterial(null);
              }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Portfolio Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                We're currently curating our best work to showcase here. Check back soon to see our latest projects!
              </p>
              <Link href="/request-quote">
                <Button>Start Your Project</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-secondary/30 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Inspired by What You See?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Let's create something unique for you. Share your vision and we'll bring it to life.
          </p>
          <Link href="/request-quote">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              Request a Quote
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
