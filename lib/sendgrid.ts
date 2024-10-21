import React from "react";
import { render } from "@react-email/components";
import sendgrid, { MailDataRequired } from "@sendgrid/mail";
import { z } from "zod";

import ResetPasswordEmail from "@/components/emails/reset-password";
import WelcomeEmail from "@/components/emails/welcome-email";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export const DeliverEmailSchema = z
  .discriminatedUnion("templateName", [
    z.object({
      templateName: z.literal("welcome"),
      emailAddress: z.string().optional(),
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
      name: z.string().optional(),
      code: z.string().optional(),
      webUrl: z.string().optional(),
    }),
    z.object({
      templateName: z.literal("reset_password"),
      email: z.string().optional(),
      name: z.string().optional(),
      token: z.string().optional(),
      webUrl: z.string().optional(),
    }),
  ])
  .and(
    z.object({
      to: z.string(),
      cc: z.array(z.string()).optional(),
      bcc: z.array(z.string()).optional(),
    }),
  );

export type DeliverEmail = z.infer<typeof DeliverEmailSchema>;

export type SendEmailOptions = {
  data: DeliverEmail;
  options?: Partial<MailDataRequired>;
};

export const sendEmail = async ({ data, options }: SendEmailOptions) => {
  const { subject, component } = getEmailTemplate(data);
  const emailHtml = await render(component);
  const msg = {
    ...options,
    from: {
      email: "web.christian.dev@gmail.com",
      name: "Pañalera Mundo Bebé",
    },
    to: data.to,
    cc: data.cc,
    bcc: data.bcc,
    html: emailHtml,
    subject,
  } satisfies MailDataRequired;

  try {
    await sendgrid.send(msg);
  } catch (error) {
    console.error("Error enviando correo", error);
    throw new Error("Error enviando correo");
  }
};

const getEmailTemplate = (
  data: DeliverEmail,
): {
  subject: string;
  component: React.ReactElement;
} => {
  switch (data.templateName) {
    case "welcome":
      return {
        subject: "¡Bienvenido/a a Mundo Bebé!",
        component: React.createElement(WelcomeEmail, {
          emailAddress: data.emailAddress,
          role: data.role,
          name: data.name,
          code: data.code,
          webUrl: data.webUrl,
        }),
      };
    case "reset_password":
      return {
        subject: "Recuperar contraseña",
        component: React.createElement(ResetPasswordEmail, {
          email: data.email,
          name: data.name,
          token: data.token,
          webUrl: data.webUrl,
        }),
      };
  }
};
