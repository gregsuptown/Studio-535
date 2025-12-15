import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Sparkles, Hammer, Package, MessageSquare, CheckCircle } from "lucide-react";

export default function Home() {
  const processSteps = [
    {
      icon: MessageSquare,
      title: "Intake & Quote",
      description: "Share your vision with us. We'll provide a detailed quote and clarify any questions to ensure we understand your needs perfectly.",
    },
    {
      icon: Sparkles,
      title: "Custom Design",
      description: "Our designers create bespoke mockups tailored to your specifications, incorporating your preferred themes, materials, and aesthetics.",
    },
    {
      icon: CheckCircle,
      title: "Client Approval",
      description: "Review designs and provide feedback. We keep you updated at every stage and refine until you're completely satisfied.",
    },
    {
      icon: Hammer,
      title: "Production",
      description: "Expert craftsmen bring your design to life using precision engraving, cutting, and fabrication techniques.",
    },
    {
      icon: Package,
      title: "Fulfillment",
      description: "Your piece is carefully packaged with care instructions and shipped directly to you with tracking information.",
    },
  ];

  return (
    <div className="min-h-screen">
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
              <a className="text-sm font-medium hover:text-accent transition-colors">Catalog</a>
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
            <Link href="/client-portal">
              <a className="text-sm font-medium hover:text-accent transition-colors">My Projects</a>
            </Link>
            <Link href="/request-quote">
              <Button variant="default" size="sm">Request Quote</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden mt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/hero-workshop.jpg)",
            filter: "brightness(0.4)",
          }}
        />
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Bespoke Design &<br />Precision Fabrication
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Transforming your vision into exceptional custom pieces through expert craftsmanship and innovative design.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/request-quote">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Start Your Project
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Create</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From laser engraving to custom fabrication, we bring your unique ideas to life with meticulous attention to detail.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <CardTitle>Laser Engraving</CardTitle>
                <CardDescription>Precision etching on wood, metal, acrylic, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Custom signage, personalized gifts, awards, and decorative pieces with intricate detail and professional finish.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <CardTitle>Custom Fabrication</CardTitle>
                <CardDescription>Bespoke furniture, fixtures, and installations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From concept to completion, we design and build custom pieces tailored to your space and specifications.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <CardTitle>Design Services</CardTitle>
                <CardDescription>Creative consultation and mockup development</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Collaborative design process ensuring your vision is captured perfectly before production begins.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A streamlined 5-step workflow designed to deliver exceptional results every time.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mb-2 text-sm font-bold text-accent">Step {index + 1}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Bring Your Vision to Life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss your project. Submit a quote request and we'll get back to you within 24 hours.
          </p>
          <Link href="/request-quote">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Request a Quote
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Studio 535</h3>
              <p className="text-sm text-muted-foreground">
                Bespoke design and fabrication studio specializing in custom engraving, laser cutting, and precision craftsmanship.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/catalog" className="text-muted-foreground hover:text-accent transition-colors">Product Catalog</Link></li>
                <li><Link href="/portfolio" className="text-muted-foreground hover:text-accent transition-colors">Portfolio</Link></li>
                <li><Link href="/process" className="text-muted-foreground hover:text-accent transition-colors">Our Process</Link></li>
                <li><Link href="/request-quote" className="text-muted-foreground hover:text-accent transition-colors">Request Quote</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                Questions? Reach out through our quote request form and we'll be in touch shortly.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Studio 535. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
