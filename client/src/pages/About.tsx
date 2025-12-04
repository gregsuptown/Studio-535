import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Award, Users, Wrench, Target, MapPin, Video, Truck, Printer, Sparkles } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every detail matters. We use state-of-the-art equipment and meticulous processes to ensure flawless results.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Your vision drives our work. We partner closely with clients throughout the entire creative process.",
    },
    {
      icon: Award,
      title: "Quality",
      description: "We never compromise on materials or craftsmanship. Each piece is built to last and exceed expectations.",
    },
    {
      icon: Wrench,
      title: "Innovation",
      description: "Combining traditional techniques with cutting-edge technology to push the boundaries of what's possible.",
    },
  ];

  const capabilities = [
    {
      icon: Printer,
      title: "3D Printing",
      description: "Multiple 3D printers for rapid prototyping and production runs. From concept to physical product in hours.",
    },
    {
      icon: Sparkles,
      title: "Laser Systems",
      description: "Precision laser systems for cutting and engraving. Intricate details on wood, acrylic, glass, metal, and leather.",
    },
    {
      icon: Wrench,
      title: "AI-Powered Design",
      description: "AI-assisted creation for design optimization. Transforming your ideas into production-ready files.",
    },
    {
      icon: Award,
      title: "100+ Materials",
      description: "Expertise across wood, acrylic, glass, metal, leather, and specialty substrates. The right material for every project.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold font-serif">Studio 535</h1>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/portfolio" className="hover:text-accent transition-colors">
              Portfolio
            </Link>
            <Link href="/process" className="hover:text-accent transition-colors">
              Process
            </Link>
            <Link href="/about" className="text-accent font-medium">
              About
            </Link>
            <Link href="/request-quote" className="hover:text-accent transition-colors">
              Request Quote
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </Link>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">
            Crafting Excellence Since 2025
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Studio 535 is a bespoke design and fabrication studio dedicated to transforming ideas into 
            exceptional custom pieces through expert craftsmanship and innovative design.
          </p>
        </div>

        {/* Founder Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-8 text-center">Meet the Founder</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Users className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-2xl font-semibold mb-2">Gregory Shugal</h3>
                    <p className="text-accent text-sm mb-4">Founder & Lead Designer</p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      With a background in precision manufacturing, digital fabrication, and AI-driven design, 
                      Gregory founded Studio 535 in 2025 to bridge traditional craftsmanship with modern innovation.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      His meticulous attention to detail and passion for pushing creative boundaries ensures every 
                      project receives the care and expertise it deserves. Gregory is continuously exploring new 
                      materials and techniques to expand what's possible in custom fabrication.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary">Digital Fabrication</Badge>
                      <Badge variant="secondary">Custom Design</Badge>
                      <Badge variant="secondary">AI-Assisted Creation</Badge>
                      <Badge variant="secondary">CAD Modeling</Badge>
                      <Badge variant="secondary">Materials Expert</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Studio 535 was founded with a simple mission: to bring exceptional custom design and 
                fabrication services to clients who demand the very best. What started as a passion for 
                creating unique, handcrafted pieces has evolved into a full-service studio equipped with 
                state-of-the-art technology and deep expertise across over 100 materials.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From 3D printing functional prototypes to laser engraving intricate patterns on wood, glass, 
                metal, and leather, we approach every project with the same dedication to quality and attention 
                to detail. Our studio combines traditional craftsmanship techniques with modern fabrication 
                technology and AI-powered design tools, allowing us to tackle projects of any scale and complexity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Studio 535 serves a diverse clientele—from individuals seeking personalized gifts and 
                home décor to businesses looking for custom signage, branded products, and architectural elements. 
                We also partner with charitable organizations, offering privacy and discretion to all our clients.
                No matter the project, our commitment remains the same: to deliver exceptional results that 
                exceed expectations.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-20 bg-muted/30 -mx-4 px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-12 text-center">What Drives Us</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <value.icon className="h-10 w-10 text-accent mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-4 text-center">Our Capabilities</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              State-of-the-art equipment combined with expert craftsmanship to deliver exceptional results.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {capabilities.map((capability, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <capability.icon className="h-10 w-10 text-accent mb-4" />
                    <h3 className="text-lg font-semibold mb-3">{capability.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {capability.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Coming Soon */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-4 text-center">Our Team</h2>
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Growing Team</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  As Studio 535 expands, we're building a talented team of designers, craftspeople, and 
                  fabricators. Stay tuned for updates!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Service Area */}
        <section className="mb-20 bg-muted/30 -mx-4 px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-8 text-center">Service Area</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-10 w-10 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">In-Person Consultations</h3>
                  <p className="text-muted-foreground text-sm">
                    Available throughout the Northeast United States. Currently transitioning from 
                    South Dartmouth, MA to the Greater Boston area.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Video className="h-10 w-10 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Video Consultations</h3>
                  <p className="text-muted-foreground text-sm">
                    Virtual design sessions available anywhere. Collaborate on your project from 
                    the comfort of your home or office.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Truck className="h-10 w-10 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Express Shipping</h3>
                  <p className="text-muted-foreground text-sm">
                    Fast delivery across the US nationwide, plus select international markets. 
                    Your project, delivered to your door.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-accent/10 -mx-4 px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-4">Ready to Start Your Project?</h2>
            <p className="text-muted-foreground mb-8">
              Let's discuss how we can bring your vision to life with expert craftsmanship and innovative design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/request-quote">
                <Button size="lg" className="w-full sm:w-auto">
                  Request a Quote
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Studio 535</h4>
              <p className="text-sm text-muted-foreground">
                Bespoke design and fabrication studio specializing in 3D printing, laser engraving, and precision craftsmanship.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/portfolio" className="text-muted-foreground hover:text-accent transition-colors">Portfolio</Link></li>
                <li><Link href="/process" className="text-muted-foreground hover:text-accent transition-colors">Our Process</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">About</Link></li>
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
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Studio 535. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
