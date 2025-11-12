import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, MessageSquare, Sparkles, CheckCircle, Hammer, Package } from "lucide-react";

export default function Process() {
  const processSteps = [
    {
      number: 1,
      icon: MessageSquare,
      title: "Intake & Quote",
      subtitle: "Share Your Vision",
      description:
        "Begin by submitting a detailed quote request through our online form. Tell us about your project—what you want to create, the materials you prefer, dimensions, quantity, and any special requirements. The more details you provide, the better we can understand your vision.",
      details: [
        "Submit project details via our online form",
        "Receive preliminary quote within 24 hours",
        "Get clarifying questions to refine specifications",
        "Review and approve the quote to proceed",
      ],
    },
    {
      number: 2,
      icon: Sparkles,
      title: "Custom Design Development",
      subtitle: "Bringing Ideas to Life",
      description:
        "Our design team takes your specifications and creates custom mockups tailored to your vision. We develop design themes, select appropriate fonts and icons, and create detailed layouts that capture exactly what you're looking for.",
      details: [
        "Receive initial design mockups and themes",
        "Review design concepts and provide feedback",
        "Request revisions until design is perfect",
        "Approve final design for production",
      ],
    },
    {
      number: 3,
      icon: CheckCircle,
      title: "Client Approval & Updates",
      subtitle: "Stay Informed",
      description:
        "Communication is key. Throughout the process, we keep you updated on progress, answer any questions, and ensure you're completely satisfied before moving forward. We welcome your feedback and make adjustments as needed.",
      details: [
        "Receive regular status updates via email",
        "Review and approve design iterations",
        "Ask questions and request changes anytime",
        "Get timeline updates and next steps",
      ],
    },
    {
      number: 4,
      icon: Hammer,
      title: "Production Setup",
      subtitle: "Precision Craftsmanship",
      description:
        "Once the design is approved, our production team prepares everything needed to bring your project to life. We configure engraver settings, prepare materials, and follow a detailed checklist to ensure quality at every step.",
      details: [
        "Materials sourced and prepared",
        "Engraving/cutting settings configured",
        "Quality checks before production begins",
        "Estimated completion date provided",
      ],
    },
    {
      number: 5,
      icon: Package,
      title: "Fulfillment & Delivery",
      subtitle: "Final Touches",
      description:
        "Your completed piece is carefully inspected, packaged with care instructions, and shipped directly to you. We include a personalized thank-you note and provide tracking information so you know exactly when to expect delivery.",
      details: [
        "Final quality inspection completed",
        "Custom packaging with care instructions",
        "Personalized thank-you message included",
        "Tracking number provided for shipment",
      ],
    },
  ];

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
              <a className="text-sm font-medium hover:text-accent transition-colors">Portfolio</a>
            </Link>
            <Link href="/process">
              <a className="text-sm font-medium text-accent">Process</a>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Process</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A streamlined 5-step workflow designed to deliver exceptional results every time. From initial concept to final delivery, we guide you through each stage with transparency and care.
          </p>
        </div>

        <div className="space-y-12">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <div key={step.number} className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-start`}>
                {/* Icon and Number */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <Card className="flex-1">
                  <CardHeader>
                    <div className="text-sm font-semibold text-accent mb-1">{step.subtitle}</div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Timeline Visualization */}
        <div className="mt-16 bg-secondary/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Typical Timeline</h2>
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">24hrs</div>
              <div className="text-sm text-muted-foreground">Quote Response</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">2-3 days</div>
              <div className="text-sm text-muted-foreground">Design Mockups</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">1-2 days</div>
              <div className="text-sm text-muted-foreground">Client Approval</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">3-7 days</div>
              <div className="text-sm text-muted-foreground">Production</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">2-5 days</div>
              <div className="text-sm text-muted-foreground">Shipping</div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            *Timelines may vary based on project complexity and current workload. Rush orders available upon request.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
            Experience our streamlined process firsthand. Submit a quote request and we'll guide you through each step.
          </p>
          <Link href="/request-quote">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Request a Quote
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
