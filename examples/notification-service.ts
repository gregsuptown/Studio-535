/**
 * NEW FILE: server/services/notification-service.ts
 *
 * Business logic for formatting notifications
 * Extracted from routers.ts for better separation of concerns
 */

interface IntakeFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectTitle: string;
  rawMessage: string;
  projectType?: string;
  material?: string;
  dimensions?: string;
  quantity?: number;
  deadline?: string;
  budget?: string;
  specialRequirements?: string;
  attachments?: Array<{
    fileName: string;
    fileSize: number;
  }>;
}

interface Notification {
  title: string;
  content: string;
}

/**
 * Format intake form data into a notification message
 */
export function formatIntakeNotification(input: IntakeFormData): Notification {
  const attachmentInfo = input.attachments && input.attachments.length > 0
    ? `\n\n📎 Attachments: ${input.attachments.length} file(s) uploaded`
    : "";

  const projectDetails = [
    `**Client Information:**`,
    `Name: ${input.clientName}`,
    `Email: ${input.clientEmail}`,
    input.clientPhone ? `Phone: ${input.clientPhone}` : null,
    ``,
    `**Project Details:**`,
    `Title: ${input.projectTitle}`,
    input.projectType ? `Type: ${input.projectType}` : null,
    ``,
    `**Description:**`,
    input.rawMessage,
    ``,
    input.material ? `Material: ${input.material}` : null,
    input.dimensions ? `Dimensions: ${input.dimensions}` : null,
    input.quantity ? `Quantity: ${input.quantity}` : null,
    input.deadline ? `Deadline: ${input.deadline}` : null,
    input.budget ? `Budget: ${input.budget}` : null,
    input.specialRequirements ? `\nSpecial Requirements:\n${input.specialRequirements}` : null,
    attachmentInfo,
  ].filter(Boolean).join('\n');

  return {
    title: `🎨 New Project Inquiry: ${input.projectTitle}`,
    content: projectDetails,
  };
}

/**
 * Format quote approval notification
 */
export function formatQuoteApprovedNotification(
  projectTitle: string,
  clientName: string,
  amount: number
): Notification {
  return {
    title: `✅ Quote Approved: ${projectTitle}`,
    content: [
      `Client ${clientName} has approved the quote!`,
      ``,
      `Amount: $${(amount / 100).toFixed(2)}`,
      ``,
      `Next steps: Begin design phase`,
    ].join('\n'),
  };
}

/**
 * Format design submission notification
 */
export function formatDesignSubmittedNotification(
  projectTitle: string,
  revisionNumber: number
): Notification {
  return {
    title: `🎨 Design Submitted: ${projectTitle}`,
    content: [
      `Design revision ${revisionNumber} has been submitted for client approval.`,
      ``,
      `Awaiting client feedback...`,
    ].join('\n'),
  };
}

/**
 * Format project completion notification
 */
export function formatProjectCompletedNotification(
  projectTitle: string,
  clientName: string
): Notification {
  return {
    title: `🎉 Project Completed: ${projectTitle}`,
    content: [
      `Project for ${clientName} has been completed and delivered!`,
      ``,
      `Don't forget to request a review and add to portfolio.`,
    ].join('\n'),
  };
}
