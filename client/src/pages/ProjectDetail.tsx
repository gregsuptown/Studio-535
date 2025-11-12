import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, Save, FileIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function ProjectDetail() {
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/admin/project/:id");
  const projectId = params?.id ? parseInt(params.id) : 0;

  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: intake } = trpc.intake.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: attachments } = trpc.intake.getAttachments.useQuery(
    { intakeId: intake?.id || 0 },
    { enabled: !!user && !!intake?.id }
  );
  const { data: quotes } = trpc.quotes.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: designs } = trpc.designs.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: statusUpdates } = trpc.statusUpdates.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: production } = trpc.production.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: fulfillment } = trpc.fulfillment.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );

  const [quoteForm, setQuoteForm] = useState({
    amount: "",
    breakdown: "",
    clarifyingQuestions: "",
    estimatedDuration: "",
  });

  const createQuote = trpc.quotes.create.useMutation({
    onSuccess: () => {
      toast.success("Quote created successfully");
      setQuoteForm({ amount: "", breakdown: "", clarifyingQuestions: "", estimatedDuration: "" });
    },
  });

  const updateStatus = trpc.projects.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Project status updated");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateQuote = () => {
    createQuote.mutate({
      projectId,
      amount: parseInt(quoteForm.amount) * 100, // Convert to cents
      breakdown: quoteForm.breakdown,
      clarifyingQuestions: quoteForm.clarifyingQuestions,
      estimatedDuration: quoteForm.estimatedDuration,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/admin">
            <a className="text-2xl font-bold text-primary hover:text-accent transition-colors">
              Studio 535 Admin
            </a>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container py-24 max-w-5xl">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{project.projectTitle}</h1>
              <p className="text-muted-foreground">
                Client: {project.clientName} • {project.clientEmail}
                {project.clientPhone && ` • ${project.clientPhone}`}
              </p>
            </div>
            <Badge className="text-lg px-4 py-2 capitalize">{project.status}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Created: {new Date(project.createdAt).toLocaleString()} • Last Updated:{" "}
            {new Date(project.updatedAt).toLocaleString()}
          </div>
        </div>

        {/* Workflow Tabs */}
        <Tabs defaultValue="intake" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intake">Intake</TabsTrigger>
            <TabsTrigger value="quote">Quote</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          </TabsList>

          {/* Intake Tab */}
          <TabsContent value="intake">
            <Card>
              <CardHeader>
                <CardTitle>Intake Form Details</CardTitle>
                <CardDescription>Client's initial project request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {intake ? (
                  <>
                    <div>
                      <Label>Project Description</Label>
                      <p className="mt-1 text-sm">{intake.rawMessage}</p>
                    </div>
                    {intake.projectType && (
                      <div>
                        <Label>Project Type</Label>
                        <p className="mt-1 text-sm">{intake.projectType}</p>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {intake.material && (
                        <div>
                          <Label>Material</Label>
                          <p className="mt-1 text-sm">{intake.material}</p>
                        </div>
                      )}
                      {intake.dimensions && (
                        <div>
                          <Label>Dimensions</Label>
                          <p className="mt-1 text-sm">{intake.dimensions}</p>
                        </div>
                      )}
                      {intake.quantity && (
                        <div>
                          <Label>Quantity</Label>
                          <p className="mt-1 text-sm">{intake.quantity}</p>
                        </div>
                      )}
                      {intake.budget && (
                        <div>
                          <Label>Budget</Label>
                          <p className="mt-1 text-sm">{intake.budget}</p>
                        </div>
                      )}
                    </div>
                    {intake.deadline && (
                      <div>
                        <Label>Deadline</Label>
                        <p className="mt-1 text-sm">{new Date(intake.deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                    {intake.specialRequirements && (
                      <div>
                        <Label>Special Requirements</Label>
                        <p className="mt-1 text-sm">{intake.specialRequirements}</p>
                      </div>
                    )}
                    {attachments && attachments.length > 0 && (
                      <div>
                        <Label>Attached Files ({attachments.length})</Label>
                        <div className="mt-2 space-y-2">
                          {attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                            >
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{attachment.fileName}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No intake form data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Tab */}
          <TabsContent value="quote">
            <div className="space-y-6">
              {/* Existing Quotes */}
              {quotes && quotes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Quotes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl font-bold">
                            ${(quote.amount / 100).toFixed(2)} {quote.currency}
                          </div>
                          <Badge>{quote.status}</Badge>
                        </div>
                        {quote.breakdown && (
                          <div className="text-sm mb-2">
                            <Label>Breakdown</Label>
                            <p className="mt-1">{quote.breakdown}</p>
                          </div>
                        )}
                        {quote.clarifyingQuestions && (
                          <div className="text-sm mb-2">
                            <Label>Clarifying Questions</Label>
                            <p className="mt-1">{quote.clarifyingQuestions}</p>
                          </div>
                        )}
                        {quote.estimatedDuration && (
                          <div className="text-sm">
                            <Label>Estimated Duration</Label>
                            <p className="mt-1">{quote.estimatedDuration}</p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(quote.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Create New Quote */}
              {user.role === "admin" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Quote</CardTitle>
                    <CardDescription>Generate a quote for this project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="500"
                        value={quoteForm.amount}
                        onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breakdown">Cost Breakdown</Label>
                      <Textarea
                        id="breakdown"
                        placeholder="Materials: $200, Labor: $250, Design: $50"
                        value={quoteForm.breakdown}
                        onChange={(e) => setQuoteForm({ ...quoteForm, breakdown: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clarifyingQuestions">Clarifying Questions</Label>
                      <Textarea
                        id="clarifyingQuestions"
                        placeholder="Any questions for the client?"
                        value={quoteForm.clarifyingQuestions}
                        onChange={(e) => setQuoteForm({ ...quoteForm, clarifyingQuestions: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                      <Input
                        id="estimatedDuration"
                        placeholder="2-3 weeks"
                        value={quoteForm.estimatedDuration}
                        onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDuration: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateQuote} disabled={createQuote.isPending || !quoteForm.amount}>
                      <Save className="w-4 h-4 mr-2" />
                      {createQuote.isPending ? "Creating..." : "Create Quote"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle>Design Development</CardTitle>
                <CardDescription>Custom design mockups and iterations</CardDescription>
              </CardHeader>
              <CardContent>
                {designs && designs.length > 0 ? (
                  <div className="space-y-4">
                    {designs.map((design) => (
                      <div key={design.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">Revision {design.revisionNumber}</div>
                          <Badge>{design.status}</Badge>
                        </div>
                        {design.designTheme && <p className="text-sm mb-2">{design.designTheme}</p>}
                        {design.mockupUrl && (
                          <div className="mb-2">
                            <a href={design.mockupUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                              View Mockup
                            </a>
                          </div>
                        )}
                        {design.designNotes && (
                          <p className="text-sm text-muted-foreground">{design.designNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No designs yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production">
            <Card>
              <CardHeader>
                <CardTitle>Production Setup</CardTitle>
                <CardDescription>Manufacturing preparation and execution</CardDescription>
              </CardHeader>
              <CardContent>
                {production ? (
                  <div className="space-y-4">
                    {production.checklist && (
                      <div>
                        <Label>Checklist</Label>
                        <p className="mt-1 text-sm whitespace-pre-line">{production.checklist}</p>
                      </div>
                    )}
                    {production.engraverSettings && (
                      <div>
                        <Label>Engraver Settings</Label>
                        <p className="mt-1 text-sm whitespace-pre-line">{production.engraverSettings}</p>
                      </div>
                    )}
                    {production.packagingSetup && (
                      <div>
                        <Label>Packaging Setup</Label>
                        <p className="mt-1 text-sm whitespace-pre-line">{production.packagingSetup}</p>
                      </div>
                    )}
                    {production.estimatedCompletionDate && (
                      <div>
                        <Label>Estimated Completion</Label>
                        <p className="mt-1 text-sm">{new Date(production.estimatedCompletionDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No production setup yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment Tab */}
          <TabsContent value="fulfillment">
            <Card>
              <CardHeader>
                <CardTitle>Fulfillment & Delivery</CardTitle>
                <CardDescription>Packaging, shipping, and delivery tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {fulfillment ? (
                  <div className="space-y-4">
                    {fulfillment.thankYouMessage && (
                      <div>
                        <Label>Thank You Message</Label>
                        <p className="mt-1 text-sm">{fulfillment.thankYouMessage}</p>
                      </div>
                    )}
                    {fulfillment.careInstructions && (
                      <div>
                        <Label>Care Instructions</Label>
                        <p className="mt-1 text-sm whitespace-pre-line">{fulfillment.careInstructions}</p>
                      </div>
                    )}
                    {fulfillment.shippingMethod && (
                      <div>
                        <Label>Shipping Method</Label>
                        <p className="mt-1 text-sm">{fulfillment.shippingMethod}</p>
                      </div>
                    )}
                    {fulfillment.trackingNumber && (
                      <div>
                        <Label>Tracking Number</Label>
                        <p className="mt-1 text-sm font-mono">{fulfillment.trackingNumber}</p>
                      </div>
                    )}
                    {fulfillment.shippedDate && (
                      <div>
                        <Label>Shipped Date</Label>
                        <p className="mt-1 text-sm">{new Date(fulfillment.shippedDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {fulfillment.deliveredDate && (
                      <div>
                        <Label>Delivered Date</Label>
                        <p className="mt-1 text-sm">{new Date(fulfillment.deliveredDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No fulfillment data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
