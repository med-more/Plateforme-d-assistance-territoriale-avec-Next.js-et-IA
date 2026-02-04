"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import pdf from "pdf-parse";
import { generateEmbeddings } from "@/lib/embeddings";
import { parseDocument } from "@/lib/document-parser";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT || "us-east-1";

export interface ExtractedFamily {
  name: string;
  district: string;
  members: number;
  needs: string[];
  priority: "high" | "medium" | "low";
}

interface VectorActionResult {
  success: boolean;
  error?: string;
  message?: string;
  extractedFamilies?: ExtractedFamily[];
  documentType?: string;
}

export async function vectorAction(
  formData: FormData
): Promise<VectorActionResult> {
  try {
    if (!PINECONE_API_KEY) {
      return {
        success: false,
        error: "PINECONE_API_KEY n'est pas configurée",
      };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        error: "Aucun fichier fourni",
      };
    }

    // Initialiser Pinecone
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });

    const index = pinecone.index(PINECONE_INDEX_NAME);

    // Lire et parser le fichier
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text: string;

    if (file.type === "application/pdf") {
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else {
      return {
        success: false,
        error: "Type de fichier non supporté",
      };
    }

    // Parser le document pour extraire les métadonnées
    const documentMetadata = parseDocument(text, file.name);

    // Diviser le texte en chunks pour l'embedding
    const chunks = chunkText(text, 1000, 200);

    // Générer des embeddings avec le service réel
    const embeddings = await generateEmbeddings(chunks, {
      taskType: "RETRIEVAL_DOCUMENT",
    });

    // Stocker dans Pinecone avec métadonnées enrichies
    const vectors = embeddings.map((embedding, idx) => ({
      id: `${file.name}-${idx}-${Date.now()}`,
      values: embedding,
      metadata: {
        filename: file.name,
        chunkIndex: idx,
        text: chunks[idx],
        timestamp: new Date().toISOString(),
        documentType: documentMetadata.type,
        // Ajouter les familles extraites si disponibles
        ...(documentMetadata.extractedFamilies && documentMetadata.extractedFamilies.length > 0 && {
          hasFamilies: true,
          familyCount: documentMetadata.extractedFamilies.length,
        }),
        // Ajouter d'autres métadonnées extraites
        ...(documentMetadata.extractedData && {
          wordCount: documentMetadata.extractedData.wordCount,
          hasPhoneNumbers: documentMetadata.extractedData.hasPhoneNumbers,
          hasEmails: documentMetadata.extractedData.hasEmails,
        }),
      },
    }));

    // Upsert par batch pour éviter les limites de l'API
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    // Construire le message de retour avec les informations extraites
    let message = `Document "${file.name}" indexé avec succès. ${chunks.length} chunks créés et stockés dans Pinecone.`;
    
    if (documentMetadata.extractedFamilies && documentMetadata.extractedFamilies.length > 0) {
      message += ` ${documentMetadata.extractedFamilies.length} famille(s) détectée(s).`;
    }
    
    if (documentMetadata.type !== "other") {
      message += ` Type: ${documentMetadata.type}.`;
    }

    return {
      success: true,
      message,
      extractedFamilies: documentMetadata.extractedFamilies,
      documentType: documentMetadata.type,
    };
  } catch (error) {
    console.error("Error in vectorAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite",
    };
  }
}

/**
 * Divise le texte en chunks avec overlap pour améliorer la récupération contextuelle
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  // Nettoyer le texte (supprimer les espaces multiples, sauts de ligne excessifs)
  const cleanedText = text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.slice(start, end).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    start = end - overlap;
    
    // Éviter les boucles infinies
    if (start >= cleanedText.length) break;
  }

  return chunks;
}
