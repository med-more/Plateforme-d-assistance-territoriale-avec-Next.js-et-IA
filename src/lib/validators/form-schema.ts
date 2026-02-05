import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Le message ne peut pas être vide").max(2000, "Le message est trop long"),
});

export const documentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "Le fichier ne doit pas dépasser 10MB")
    .refine(
      (file) => {
        const validTypes = [
          "application/pdf",
          "text/plain",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ];
        const validExtensions = [".pdf", ".txt", ".xlsx", ".xls"];
        const fileName = file.name.toLowerCase();
        return (
          validTypes.includes(file.type) ||
          validExtensions.some((ext) => fileName.endsWith(ext))
        );
      },
      "Seuls les fichiers PDF, TXT et Excel (XLSX, XLS) sont acceptés"
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
