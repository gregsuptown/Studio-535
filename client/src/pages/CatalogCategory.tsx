import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Search, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";

// Design level badge colors
const designLevelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-purple-100 text-purple-800",
};

const designLevelLabels: Record<string, string> = {
  low: "Stock",
  medium: "Personalization",
  high: "Custom Design",
};

export default function CatalogCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "newest" | "featured">("name");
  const [designLevel, setDesignLevel] = useState<"all" | "low" | "medium" | "high">("all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch category info
  const { data: category, isLoading: categoryLoading } = trpc.catalog.getCategoryBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = trpc.catalog.getProducts.useQuery(
    {
      categoryId: category?.id,
      search: search || undefined,
      sortBy,
      designLevel: designLevel === "all" ? undefined : designLevel,
      page,
      limit: 24,
    },
    { enabled: !!category?.id }
  );

  const isLoading = categoryLoading || productsLoading;
  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Format price (stored in cents)
  const formatPrice = (cents: number | null) => {
    if (!cents) return "Contact for pricing";
    return `$${(cents / 100).toFixed(2)}`;
  };

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
            <Link href="/request-quote">
              <Button variant="default" size="sm">Request Quote</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-24">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/catalog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </Link>
          
          {category && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                {category.description}
              </p>
              {category.serviceType && (
                <div className="mt-4">
                  <span className="text-sm text-accent font-medium">
                    Service Type: {category.serviceType}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-secondary/30 rounded-lg">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price">Price Low-High</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>

          {/* Design Level Filter */}
          <Select value={designLevel} onValueChange={(v) => {
            setDesignLevel(v as typeof designLevel);
            setPage(1);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Design level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="low">Stock Items</SelectItem>
              <SelectItem value="medium">Personalization</SelectItem>
              <SelectItem value="high">Custom Design</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex gap-1 bg-background rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        {pagination && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {products.length} of {pagination.total} products
          </div>
        )}

        {/* Products */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : products.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/catalog/product/${product.jdsSku}`}>
                    <Card className="h-full hover:shadow-lg transition-all hover:border-accent cursor-pointer group overflow-hidden">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                        {product.isFeatured === 1 && (
                          <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                        <div className={`absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${designLevelColors[product.designLevel]}`}>
                          {designLevelLabels[product.designLevel]}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">{product.jdsSku}</p>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-accent mt-2">
                          {formatPrice(product.retailPrice)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/catalog/product/${product.jdsSku}`}>
                    <Card className="hover:shadow-lg transition-all hover:border-accent cursor-pointer group">
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">{product.jdsSku}</p>
                              <h3 className="font-semibold group-hover:text-accent transition-colors">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-accent">
                                {formatPrice(product.retailPrice)}
                              </p>
                              <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-1 ${designLevelColors[product.designLevel]}`}>
                                {designLevelLabels[product.designLevel]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? "Try adjusting your search or filters." : "Products are being added to this category."}
              </p>
              <Button onClick={() => { setSearch(""); setDesignLevel("all"); }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {/* CTA */}
        <div className="mt-16 bg-secondary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our team can help you find the perfect products for your project and provide custom design services.
          </p>
          <Link href="/request-quote">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              Get Expert Assistance
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
