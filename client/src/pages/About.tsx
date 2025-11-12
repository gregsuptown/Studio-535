import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Award, Users, Wrench, Target } from "lucide-react";

export default function About() {
  const teamMembers = [
    {
      name: "Your Name",
      role: "Founder & Lead Designer",
      bio: "With over 10 years of experience in custom fabrication and design, [Name] brings a unique blend of artistic vision and technical precision to every project.",
      expertise: ["Laser Engraving", "Custom Fabrication", "Design Consultation"],
    },
    {
      name: "Team Member 2",
      role: "Master Craftsperson",
      bio: "Specializing in precision metalwork and woodworking, [Name] ensures every piece meets the highest standards of quality and craftsmanship.",
      expertise: ["Metal Fabrication", "Woodworking", "CNC Operation"],
    },
    {
      name: "Team Member 3",
      role: "Design Specialist",
      bio: "From concept sketches to final mockups, [Name] transforms client visions into detailed designs ready for production.",
      expertise: ["3D Modeling", "Graphic Design", "Prototyping"],
    },
  ];

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
            Crafting Excellence Since [Year]
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Studio 535 is a bespoke design and fabrication studio dedicated to transforming ideas into 
            exceptional custom pieces through expert craftsmanship and innovative design.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Studio 535 was founded with a simple mission: to bring exceptional custom design and 
                fabrication services to clients who demand the very best. What started as a passion for 
                creating unique, handcrafted pieces has evolved into a full-service studio equipped with 
                state-of-the-art technology and a team of skilled artisans.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From laser engraving intricate patterns on wood and metal to designing and building custom 
                furniture and installations, we approach every project with the same dedication to quality 
                and attention to detail. Our studio combines traditional craftsmanship techniques with modern 
                fabrication technology, allowing us to tackle projects of any scale and complexity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Studio 535 serves a diverse clientele—from individuals seeking personalized gifts and 
                home décor to businesses looking for custom signage, branded products, and architectural elements. 
                No matter the project, our commitment remains the same: to deliver exceptional results that 
                exceed expectations.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-12 text-center">Our Journey</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-accent/30 hidden md:block" />
              
              {/* Timeline Items */}
              <div className="space-y-12">
                {/* Milestone 1 */}
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 md:text-right">
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                      <div className="text-accent font-bold text-lg mb-2">[Year] - Founded</div>
                      <h3 className="font-semibold text-xl mb-2">Studio 535 Begins</h3>
                      <p className="text-muted-foreground text-sm">
                        Started with a passion for custom engraving and a single laser cutter in a small workshop, 
                        taking on personalized gifts and small-scale projects.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-accent border-4 border-background shadow-lg" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>

                {/* Milestone 2 */}
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 hidden md:block" />
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-accent border-4 border-background shadow-lg" />
                  </div>
                  <div className="flex-1 md:text-left">
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                      <div className="text-accent font-bold text-lg mb-2">[Year] - Expansion</div>
                      <h3 className="font-semibold text-xl mb-2">New Equipment & Capabilities</h3>
                      <p className="text-muted-foreground text-sm">
                        Invested in advanced CNC machines and expanded the workshop, enabling us to take on 
                        larger custom fabrication projects and architectural installations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 md:text-right">
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                      <div className="text-accent font-bold text-lg mb-2">[Year] - Team Growth</div>
                      <h3 className="font-semibold text-xl mb-2">Building Our Expert Team</h3>
                      <p className="text-muted-foreground text-sm">
                        Brought together talented designers, craftspeople, and fabricators to form a dedicated 
                        team committed to delivering exceptional custom work.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-accent border-4 border-background shadow-lg" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>

                {/* Milestone 4 */}
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 hidden md:block" />
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-accent border-4 border-background shadow-lg" />
                  </div>
                  <div className="flex-1 md:text-left">
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                      <div className="text-accent font-bold text-lg mb-2">[Year] - Recognition</div>
                      <h3 className="font-semibold text-xl mb-2">Award-Winning Craftsmanship</h3>
                      <p className="text-muted-foreground text-sm">
                        Recognized for excellence in custom fabrication and design, earning trust from both 
                        individual clients and major commercial partners.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestone 5 - Present */}
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 md:text-right">
                    <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 shadow-sm">
                      <div className="text-accent font-bold text-lg mb-2">Today</div>
                      <h3 className="font-semibold text-xl mb-2">Full-Service Studio</h3>
                      <p className="text-muted-foreground text-sm">
                        Operating a state-of-the-art facility with cutting-edge technology, serving a diverse 
                        clientele with custom engraving, fabrication, and design services.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-accent border-4 border-background shadow-lg animate-pulse" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              </div>
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

        {/* Meet the Team */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-4 text-center">Meet the Team</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our talented team brings together diverse skills and expertise to deliver exceptional results on every project.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Users className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-accent text-sm mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-8 text-center">Our Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Laser Engraving & Cutting</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Precision etching and cutting on wood, metal, acrylic, leather, and more. Perfect for 
                    custom signage, personalized gifts, and intricate decorative pieces.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Custom Fabrication</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    From concept to completion, we design and build bespoke furniture, fixtures, and 
                    installations tailored to your exact specifications.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Design Services</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Collaborative design consultation and mockup development to ensure your vision is 
                    captured perfectly before production begins.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Production & Finishing</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Expert craftsmanship in metalwork, woodworking, and finishing techniques to deliver 
                    professional-grade results every time.
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
            <Link href="/request-quote">
              <button className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                Request a Quote
              </button>
            </Link>
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
                Bespoke design and fabrication studio specializing in custom engraving, laser cutting, and precision craftsmanship.
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
