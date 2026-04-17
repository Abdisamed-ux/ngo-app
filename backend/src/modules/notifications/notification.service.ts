/**
 * Service to simulate external dispatch logic to APIs like SendGrid or Twilio
 */

export const sendEmailStub = async (to: string, subject: string, body: string): Promise<void> => {
  // In a real environment: Use @sendgrid/mail
  console.log(`[SendGrid Stub] Mocking email dispatch`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log(`-------------------------------------`);
};

export const sendSmsStub = async (to: string, message: string): Promise<void> => {
  // In a real environment: Use twilio SDK
  console.log(`[Twilio Stub] Mocking SMS dispatch`);
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log(`-------------------------------------`);
};
