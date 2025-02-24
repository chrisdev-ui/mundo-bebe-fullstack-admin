import React from "react";
import { render } from "@react-email/components";
import sendgrid, { MailDataRequired } from "@sendgrid/mail";
import { z } from "zod";

import ResetPasswordEmail from "@/components/emails/reset-password-email";
import WelcomeEmail from "@/components/emails/welcome-email";
import { env } from "@/env";
import { UserRole } from "@/types/enum";

sendgrid.setApiKey(env.SENDGRID_API_KEY);

export const DeliverEmailSchema = z
  .discriminatedUnion("templateName", [
    z.object({
      templateName: z.literal("welcome"),
      role: z
        .enum([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])
        .optional(),
      name: z.string().optional(),
      webUrl: z.string().optional(),
    }),
    z.object({
      templateName: z.literal("reset_password"),
      name: z.string().optional(),
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
          role: data.role,
          name: data.name,
          webUrl: data.webUrl,
        }),
      };
    case "reset_password":
      return {
        subject: "Recuperar contraseña",
        component: React.createElement(ResetPasswordEmail, {
          name: data.name,
          webUrl: data.webUrl,
        }),
      };
  }
};
