import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Upload, X, FileIcon } from "lucide-react";

export default function RequestQuote() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectTitle: "",
    rawMessage: "",
    projectType: "",
    material: "",
    dimensions: "",
    quantity: "",
    deadline: "",
    budget: "",
    specialRequirements: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const submitIntake = trpc.intake.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Quote request submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit request. Please try again.");
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Check file size (max 10MB per file)
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error("Some files are too large. Maximum file size is 10MB.");
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let uploadedAttachments: Array<{
      fileUrl: string;
      fileKey: string;
      fileName: string;
      fileSize: number;
      mimeType?: string;
    }> = [];

    // Upload files to S3 if any
    if (files.length > 0) {
      setUploading(true);
      try {
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const fileKey = `intake-attachments/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
          
          // Note: This is a client-side call - in production, you'd want to upload via a server endpoint
          // For now, we'll pass the file data to the mutation and handle upload server-side
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const base64 = await base64Promise;
          
          uploadedAttachments.push({
            fileUrl: base64, // Temporary - will be replaced with S3 URL server-side
            fileKey,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });
        }
      } catch (error) {
        toast.error("Failed to upload files. Please try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    submitIntake.mutate({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone || undefined,
      projectTitle: formData.projectTitle,
      rawMessage: formData.rawMessage,
      projectType: formData.projectType || undefined,
      material: formData.material || undefined,
      dimensions: formData.dimensions || undefined,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      deadline: formData.deadline || undefined,
      budget: formData.budget || undefined,
      specialRequirements: formData.specialRequirements || undefined,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl">Request Received!</CardTitle>
            <CardDescription>
              Thank you for your interest in Studio 535. We've received your quote request and will review it shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We'll get back to you within 24 hours with a detailed quote and any clarifying questions.
            </p>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    clientName: "",
                    clientEmail: "",
                    clientPhone: "",
                    projectTitle: "",
                    rawMessage: "",
                    projectType: "",
                    material: "",
                    dimensions: "",
                    quantity: "",
                    deadline: "",
                    budget: "",
                    specialRequirements: "",
                  });
                }}
                className="flex-1"
              >
                Submit Another Request
              </Button>
            </div>
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container max-w-3xl py-24">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Quote</h1>
          <p className="text-lg text-muted-foreground">
            Tell us about your project and we'll provide a detailed quote within 24 hours.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Please provide as much information as possible to help us understand your vision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number (Optional)</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    required
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="e.g., Custom Wedding Sign, Corporate Awards, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rawMessage">Project Description *</Label>
                  <Textarea
                    id="rawMessage"
                    required
                    value={formData.rawMessage}
                    onChange={(e) => setFormData({ ...formData, rawMessage: e.target.value })}
                    placeholder="Describe your project in detail. What do you envision? What's the purpose? Any specific design elements?"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type</Label>
                    <Input
                      id="projectType"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      placeholder="e.g., Signage, Award, Gift, Furniture"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Preferred Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., Wood, Metal, Acrylic, Glass"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder='e.g., 12" x 18", 30cm x 40cm'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="e.g., $100-$500, Flexible"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                    placeholder="Any specific design elements, colors, fonts, or other requirements?"
                    rows={3}
                  />
                </div>
              </div>

              {/* File Attachments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Design Files & References</h3>
                <div className="space-y-2">
                  <Label htmlFor="fileUpload">Upload Files (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Attach design files, reference images, sketches, or inspiration materials (Max 10MB per file)
                  </p>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Input
                      id="fileUpload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.ai,.psd,.sketch"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload files</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: Images, PDF, AI, PSD, Sketch
                      </p>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium">Selected Files ({files.length}):</p>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/">
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitIntake.isPending || uploading} className="flex-1">
                  {uploading ? "Uploading files..." : submitIntake.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
