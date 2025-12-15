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
import { Loader2, ArrowLeft, Save, FileIcon, Download, Paperclip, X } from "lucide-react";
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="intake">Intake</TabsTrigger>
            <TabsTrigger value="quote">Quote</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
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

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Project Messages</CardTitle>
                <CardDescription>Communicate with the client about this project</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminMessageThread projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Generate payment links for deposits and final balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentSection projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Payment Section Component
 */
function PaymentSection({ projectId }: { projectId: number }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: projectOrders = [], isLoading: ordersLoading } = trpc.stripe.getOrdersByProjectId.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const createDepositMutation = trpc.stripe.createDepositSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Payment link generated! Opening in new tab...");
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(`Failed to create payment link: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const createBalanceMutation = trpc.stripe.createBalanceSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Payment link generated! Opening in new tab...");
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(`Failed to create payment link: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const handleDepositPayment = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsProcessing(true);
    const amountInCents = Math.round(amount * 100);
    createDepositMutation.mutate({ projectId, totalAmount: amountInCents });
  };

  const handleBalancePayment = () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsProcessing(true);
    const amountInCents = Math.round(amount * 100);
    createBalanceMutation.mutate({ projectId, totalAmount: amountInCents });
  };

  return (
    <div className="space-y-6">
      {/* Previous Orders & Invoices */}
      {ordersLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B6F47]" />
        </div>
      ) : projectOrders.length > 0 ? (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Payment History & Invoices</h3>
          <div className="space-y-3">
            {projectOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant={order.status === "paid" ? "default" : "secondary"} className="capitalize">
                      {order.status}
                    </Badge>
                    <span className="font-medium capitalize">{order.orderType}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-semibold">${(order.total / 100).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Order #{order.orderNumber} • Invoice #{order.invoiceNumber}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(order.createdAt).toLocaleString()}
                    {order.paidAt && ` • Paid: ${new Date(order.paidAt).toLocaleString()}`}
                  </div>
                </div>
                {order.invoicePdfUrl && (
                  <a
                    href={order.invoicePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Deposit Payment */}
      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Deposit Payment (10%)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a payment link for the initial 10% deposit
          </p>
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="depositAmount">Total Project Amount ($)</Label>
            <Input
              id="depositAmount"
              type="number"
              placeholder="e.g., 5000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="mt-2"
            />
            {depositAmount && !isNaN(parseFloat(depositAmount)) && (
              <p className="text-sm text-muted-foreground mt-2">
                Deposit amount: ${(parseFloat(depositAmount) * 0.1).toFixed(2)}
              </p>
            )}
          </div>
          <Button
            onClick={handleDepositPayment}
            disabled={isProcessing || !depositAmount}
            className="bg-[#8B6F47] hover:bg-[#6B5437]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate Deposit Link"
            )}
          </Button>
        </div>
      </div>

      {/* Balance Payment */}
      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Balance Payment (90%)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a payment link for the final 90% balance upon completion
          </p>
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="balanceAmount">Total Project Amount ($)</Label>
            <Input
              id="balanceAmount"
              type="number"
              placeholder="e.g., 5000"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              className="mt-2"
            />
            {balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
              <p className="text-sm text-muted-foreground mt-2">
                Balance amount: ${(parseFloat(balanceAmount) * 0.9).toFixed(2)}
              </p>
            )}
          </div>
          <Button
            onClick={handleBalancePayment}
            disabled={isProcessing || !balanceAmount}
            className="bg-[#8B6F47] hover:bg-[#6B5437]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate Balance Link"
            )}
          </Button>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">How it works:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Enter the total project amount</li>
          <li>Click the button to generate a secure Stripe payment link</li>
          <li>Share the link with your client via email or message</li>
          <li>Client completes payment through Stripe checkout</li>
          <li>You'll receive a notification when payment is successful</li>
          <li>Invoice PDF is automatically generated and stored</li>
        </ol>
      </div>
    </div>
  );
}


/**
 * Admin Message Thread Component
 */
function AdminMessageThread({ projectId }: { projectId: number }) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const { data: messages = [], isLoading } = trpc.messages.list.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0, refetchInterval: 5000 }
  );

  const uploadFile = trpc.messages.uploadFile.useMutation();

  const sendMessage = trpc.messages.create.useMutation({
    onSuccess: () => {
      setNewMessage("");
      setSelectedFiles([]);
      utils.messages.list.invalidate({ projectId });
      toast.success("Message sent to client");
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files first
      const uploadedAttachments = [];
      for (const file of selectedFiles) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1]; // Remove data:image/png;base64, prefix
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await uploadFile.mutateAsync({
          fileName: file.name,
          fileData,
          fileType: file.type,
        });

        uploadedAttachments.push({
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileType: file.type,
          fileSize: result.fileSize,
        });
      }

      // Send message with attachments
      sendMessage.mutate({
        projectId,
        message: newMessage || "(File attachment)",
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      });
    } catch (error) {
      toast.error("Failed to upload files");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B6F47]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message History */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation with your client!
          </p>
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.senderRole === "admin"
                    ? "bg-[#8B6F47] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">{msg.senderName}</span>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((attachment: any, idx: number) => (
                      <a
                        key={idx}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-black/10 rounded hover:bg-black/20 transition-colors"
                      >
                        <FileIcon className="h-3 w-3" />
                        <span className="text-xs">{attachment.fileName}</span>
                        {attachment.fileSize && (
                          <span className="text-xs opacity-70 ml-auto">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Message Input */}
      <div className="space-y-2">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                <FileIcon className="h-3 w-3" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Type your message to the client..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isUploading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1"
              rows={3}
            />
            <div className="flex gap-2">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || isUploading}
            className="bg-[#8B6F47] hover:bg-[#6B5437] self-end"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
