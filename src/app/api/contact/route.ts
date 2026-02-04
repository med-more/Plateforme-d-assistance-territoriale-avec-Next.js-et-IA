import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validators/form-schema";

/**
 * API Route pour traiter les soumissions du formulaire de contact
 * POST /api/contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valider les données avec Zod
    const validationResult = contactFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validationResult.data;

    // Ici, vous pouvez:
    // 1. Envoyer un email (avec Resend, SendGrid, etc.)
    // 2. Sauvegarder dans une base de données
    // 3. Envoyer à un service externe (Zapier, etc.)
    
    // Pour l'instant, on simule l'envoi
    console.log("Nouveau message de contact:", {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implémenter l'envoi d'email réel
    // Exemple avec Resend:
    // await resend.emails.send({
    //   from: 'contact@aura-link.ma',
    //   to: 'admin@aura-link.ma',
    //   subject: `Contact: ${subject}`,
    //   html: `<p>De: ${name} (${email})</p><p>${message}</p>`,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
