import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    PINECONE_API_KEY: !!process.env.PINECONE_API_KEY,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || "non configuré",
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || "non configuré",
  };

  const allConfigured = 
    envCheck.GEMINI_API_KEY && 
    envCheck.PINECONE_API_KEY && 
    envCheck.PINECONE_INDEX_NAME !== "non configuré" &&
    envCheck.PINECONE_ENVIRONMENT !== "non configuré";

  return NextResponse.json({
    status: allConfigured ? "ok" : "error",
    configured: allConfigured,
    variables: envCheck,
    message: allConfigured
      ? "Toutes les variables d'environnement sont configurées"
      : "Certaines variables d'environnement manquent. Vérifiez les paramètres Vercel.",
  });
}
