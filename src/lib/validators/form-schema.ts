import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Le message ne peut pas être vide").max(2000, "Le message est trop long"),
});

export const documentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "Le fichier ne doit pas dépasser 10MB")
    .refine(
      (file) => ["application/pdf", "text/plain"].includes(file.type),
      "Seuls les fichiers PDF et TXT sont acceptés"
    ),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
  email: z.string().email("Adresse email invalide").max(255, "L'email est trop long"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères").max(200, "Le sujet est trop long"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000, "Le message est trop long"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
