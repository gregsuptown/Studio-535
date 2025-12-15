import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Package, Ruler, Palette, ShoppingCart, MessageSquare } from "lucide-react";

// Design level badge colors
const designLevelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-purple-100 text-purple-800",
};

const designLevelLabels: Record<string, string> = {
  low: "Stock Item - Ready to Ship",
  medium: "Personalization Available",
  high: "Full Custom Design Service",
};

const designLevelDescriptions: Record<string, string> = {
  low: "This item ships as-is with minimal customization options.",
  medium: "Add names, dates, logos, and custom text to this product.",
  high: "Work with our designers to create a completely unique piece.",
};

export default function CatalogProduct() {
  const { sku } = useParams<{ sku: string }>();

  const { data: product, isLoading, error } = trpc.catalog.getProductBySku.useQuery(
    { sku: sku || "" },
    { enabled: !!sku }
  );

  // Format price (stored in cents)
  const formatPrice = (cents: number | null | undefined) => {
    if (!cents) return null;
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <Link href="/">
              <a className="text-2xl font-bold text-primary hover:text-accent transition-colors">
                Studio 535
              </a>
            </Link>
          </div>
        </nav>
        <div className="container py-24">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/catalog">
              <Button>Back to Catalog</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

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
            <Link href="/request-quote">
              <Button variant="default" size="sm">Request Quote</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-24">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href={product.category ? `/catalog/${product.category.slug}` : "/catalog"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {product.category?.name || "Catalog"}
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-24 h-24 opacity-20" />
                </div>
              )}
              {product.isFeatured === 1 && (
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground font-semibold px-3 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">SKU: {product.jdsSku}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            
            {/* Design Level Badge */}
            <div className={`inline-block text-sm font-medium px-3 py-1 rounded-full mb-4 ${designLevelColors[product.designLevel]}`}>
              {designLevelLabels[product.designLevel]}
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.retailPrice ? (
                <div className="text-4xl font-bold text-accent">
                  {formatPrice(product.retailPrice)}
                </div>
              ) : (
                <div className="text-xl font-medium text-muted-foreground">
                  Contact for Pricing
                </div>
              )}
              {product.minOrderQty > 1 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum order: {product.minOrderQty} units
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Pricing Tiers */}
            {product.pricingTiers && product.pricingTiers.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Volume Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.pricingTiers.map((tier, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {tier.minQuantity}
                          {tier.maxQuantity ? `-${tier.maxQuantity}` : "+"} units
                        </span>
                        <span className="font-medium">
                          {formatPrice(tier.pricePerUnit)} each
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Specs */}
            <div className="space-y-3 mb-6">
              {product.dimensions && (
                <div className="flex items-center gap-3 text-sm">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{product.dimensions}</span>
                </div>
              )}
              {product.material && (
                <div className="flex items-center gap-3 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Material:</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-3 text-sm">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium">{product.color}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Design Service Info */}
            <Card className="mb-6 bg-secondary/30 border-0">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Design Service Included</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {designLevelDescriptions[product.designLevel]}
                </p>
                {product.designLevel !== "low" && (
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Free design consultation</li>
                    <li>• Digital proof before production</li>
                    <li>• Unlimited revisions until approval</li>
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/request-quote?product=${product.jdsSku}&name=${encodeURIComponent(product.name)}`} className="flex-1">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Request Quote
                </Button>
              </Link>
              <Link href="/request-quote" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask a Question
                </Button>
              </Link>
            </div>

            {/* Stock Status */}
            <div className="mt-6 text-center">
              {product.inStock === 1 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Made to Order
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Long Description */}
        {product.descriptionLong && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {product.descriptionLong}
            </div>
          </div>
        )}

        {/* Related CTA */}
        <div className="mt-16 bg-secondary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Request a quote to get pricing for your specific requirements, including customization and quantity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={`/request-quote?product=${product.jdsSku}`}>
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Get a Quote for This Product
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="outline">
                Continue Browsing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
