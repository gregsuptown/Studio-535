import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

export default function CaseStudy() {
  const [, params] = useRoute("/portfolio/:id");
  const portfolioId = params?.id ? parseInt(params.id) : 0;

  const { data: portfolioItems, isLoading } = trpc.portfolio.list.useQuery();
  const item = portfolioItems?.find((p) => p.id === portfolioId);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = item?.title || 'Check out this project';

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/portfolio">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolio
              </Button>
            </Link>
          </CardContent>
        </Card>
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

      <div className="container py-24 max-w-5xl">
        {/* Back Button */}
        <Link href="/portfolio">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{item.title}</h1>
              <div className="flex gap-2">
                {item.category && (
                  <Badge variant="secondary">{item.category}</Badge>
                )}
                {item.material && (
                  <Badge variant="outline">{item.material}</Badge>
                )}
                {item.featured === 1 && (
                  <Badge className="bg-accent">Featured</Badge>
                )}
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('facebook')}
                title="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('twitter')}
                title="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('linkedin')}
                title="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('copy')}
                title="Copy link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {item.clientName && (
            <p className="text-muted-foreground">
              Client: {item.clientName}
              {item.projectDuration && ` • Duration: ${item.projectDuration}`}
            </p>
          )}
        </div>

        {/* Main Image */}
        <div className="mb-12 rounded-lg overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full object-cover"
          />
        </div>

        {/* Before/After Images */}
        {(item.beforeImageUrl || item.afterImageUrl) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Transformation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {item.beforeImageUrl && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-center">Before</h3>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={item.beforeImageUrl}
                      alt={`${item.title} - Before`}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              )}
              {item.afterImageUrl && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-center">After</h3>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={item.afterImageUrl}
                      alt={`${item.title} - After`}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Overview */}
        {item.description && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Case Study Details */}
        {(item.challenge || item.solution || item.outcome) && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {item.challenge && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">The Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.challenge}</p>
                </CardContent>
              </Card>
            )}
            {item.solution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Our Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.solution}</p>
                </CardContent>
              </Card>
            )}
            {item.outcome && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">The Outcome</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.outcome}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Client Testimonial */}
        {item.testimonialText && (
          <Card className="mb-12 bg-accent/5 border-accent/20">
            <CardContent className="p-8">
              <div className="text-4xl text-accent mb-4">"</div>
              <p className="text-lg italic mb-6">{item.testimonialText}</p>
              {item.testimonialAuthor && (
                <div className="text-right">
                  <p className="font-semibold">{item.testimonialAuthor}</p>
                  {item.testimonialRole && (
                    <p className="text-sm text-muted-foreground">{item.testimonialRole}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="bg-secondary/30">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's create something amazing together. Request a quote and bring your vision to life.
            </p>
            <Link href="/request-quote">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Request a Quote
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
