"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from "@/lib/embeddings";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";

interface ChatActionResult {
  text: ReadableStream<Uint8Array>;
}

export async function chatAction(
  message: string
): Promise<ChatActionResult | string> {
  try {
    if (!GEMINI_API_KEY) {
      return "Erreur: GEMINI_API_KEY n'est pas configurée. Veuillez configurer votre clé API dans .env.local";
    }

    if (!PINECONE_API_KEY) {
      console.error("PINECONE_API_KEY is missing. Check Vercel environment variables.");
      return "Erreur: PINECONE_API_KEY n'est pas configurée. Veuillez configurer la variable d'environnement PINECONE_API_KEY dans les paramètres de votre projet Vercel (Settings → Environment Variables).";
    }

    // Initialiser Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Liste des modèles Gemini 2.5 à essayer dans l'ordre de priorité
    // Essayer d'abord les modèles Gemini 2.5, puis fallback vers 2.0 et 1.5
    const availableModels = [
      "gemini-2.5-pro",        // Gemini 2.5 Pro (recommandé)
      "gemini-2.5-flash",      // Gemini 2.5 Flash (rapide)
      "gemini-2.5-pro-exp",    // Gemini 2.5 Pro (expérimental)
      "gemini-2.5-flash-exp",  // Gemini 2.5 Flash (expérimental)
      "gemini-2.0-flash-exp",  // Fallback: Gemini 2.0 Flash (expérimental)
      "gemini-2.0-flash",      // Fallback: Gemini 2.0 Flash (stable)
      "gemini-1.5-flash",      // Fallback: Gemini 1.5 Flash
      "gemini-1.5-pro",        // Fallback: Gemini 1.5 Pro
    ];

    // Récupérer le contexte depuis Pinecone (RAG)
    let context = "";
    try {
      const pinecone = new Pinecone({
        apiKey: PINECONE_API_KEY,
      });

      const index = pinecone.index(PINECONE_INDEX_NAME);

      // Générer un embedding pour la requête avec le service réel
      const queryEmbedding = await generateEmbedding(message, {
        taskType: "RETRIEVAL_QUERY",
      });

      // Rechercher les documents les plus pertinents
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
        filter: undefined, // Vous pouvez ajouter des filtres par métadonnées si nécessaire
      });

      // Construire le contexte à partir des résultats
      if (queryResponse.matches && queryResponse.matches.length > 0) {
        context = queryResponse.matches
          .map((match, index) => {
            const metadata = match.metadata as { 
              text?: string; 
              filename?: string;
              chunkIndex?: number;
            };
            const score = match.score || 0;
            const source = metadata.filename || "Document";
            const chunkInfo = metadata.chunkIndex !== undefined 
              ? ` (Chunk ${metadata.chunkIndex + 1})` 
              : "";
            
            // Inclure le score de similarité et la source pour plus de contexte
            return `[Source: ${source}${chunkInfo}, Score: ${score.toFixed(3)}]\n${metadata.text || ""}`;
          })
          .filter((text) => text.length > 0)
          .join("\n\n---\n\n");
      }
    } catch (error) {
      console.error("Error querying Pinecone:", error);
      // Continuer sans contexte si Pinecone échoue
    }

    // Construire le prompt avec le contexte RAG
    const systemPrompt = `Tu es l'Assistant Sadaqa, un assistant intelligent pour les associations caritatives de Casablanca pendant le Ramadan.

Ton rôle est d'aider les bénévoles et donateurs avec:
- Les informations sur les familles nécessiteuses par quartier
- La gestion des dons Zakat et Sadaqa
- L'organisation des distributions de Quffat Ramadan
- La coordination des Iftars collectifs
- Les guides et règles de la Zakat
- Le suivi des inventaires et des besoins

Instructions importantes:
- Réponds toujours en français, de manière claire, empathique et respectueuse
- Si tu as des informations contextuelles issues des documents indexés, utilise-les en priorité
- Cite les sources quand tu utilises des informations spécifiques
- Si tu n'as pas d'information précise dans le contexte, dis-le clairement
- Sois précis avec les chiffres, dates et noms de quartiers`;

    const fullPrompt = context
      ? `${systemPrompt}\n\n=== CONTEXTE DISPONIBLE (documents indexés) ===\n${context}\n\n=== QUESTION DE L'UTILISATEUR ===\n${message}\n\nRéponds en te basant sur le contexte fourni ci-dessus. Si le contexte contient des informations pertinentes, utilise-les. Sinon, réponds de manière générale.`
      : `${systemPrompt}\n\n=== QUESTION DE L'UTILISATEUR ===\n${message}\n\nRéponds de manière générale. Si tu n'as pas d'information spécifique, propose à l'utilisateur d'indexer des documents pertinents.`;

    // Générer la réponse avec streaming
    // Essayer chaque modèle Gemini 2.5 jusqu'à trouver un qui fonctionne
    let result;
    let lastError: Error | null = null;
    let workingModel: string | null = null;
    
    for (const modelName of availableModels) {
      try {
        console.log(`🔍 Tentative avec le modèle Gemini: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Essayer de générer le contenu avec ce modèle
        // Utiliser la syntaxe simple d'abord
        try {
          result = await model.generateContentStream(fullPrompt);
          workingModel = modelName;
          console.log(`✅ Modèle ${modelName} fonctionne !`);
          break;
        } catch (streamError) {
          // Si la syntaxe simple échoue, essayer avec la syntaxe complète
          const streamErrorMessage = streamError instanceof Error ? streamError.message : String(streamError);
          if (streamErrorMessage.includes("404") || streamErrorMessage.includes("not found")) {
            throw streamError; // Re-lancer pour passer au modèle suivant
          }
          
          console.log(`⚠️ Syntaxe simple échouée, essai avec syntaxe complète pour ${modelName}`);
          try {
            result = await model.generateContentStream({
              contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            });
            workingModel = modelName;
            console.log(`✅ Modèle ${modelName} fonctionne avec syntaxe complète !`);
            break;
          } catch (altError) {
            throw streamError; // Utiliser l'erreur originale
          }
        }
      } catch (modelError) {
        const errorMessage = modelError instanceof Error ? modelError.message : String(modelError);
        console.warn(`❌ Modèle ${modelName} non disponible: ${errorMessage.substring(0, 100)}`);
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError));
        continue;
      }
    }
    
    // Si tous les modèles ont échoué
    if (!result) {
      const errorDetails = lastError?.message || "Inconnue";
      throw new Error(
        `Aucun modèle Gemini 2.5 disponible. ` +
        `Modèles essayés: ${availableModels.join(", ")}. ` +
        `Dernière erreur: ${errorDetails}. ` +
        `Veuillez vérifier: 1) Que votre clé API Gemini est valide, 2) Que votre compte a accès aux modèles Gemini 2.5, ` +
        `3) Consultez https://ai.google.dev/models pour voir les modèles disponibles dans votre région.`
      );
    }

    // Créer un ReadableStream pour le streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error streaming response:", error);
          controller.error(error);
        }
      },
    });

    return { text: stream };
  } catch (error) {
    console.error("Error in chatAction:", error);
    return `Désolé, une erreur s'est produite: ${
      error instanceof Error ? error.message : "Erreur inconnue"
    }`;
  }
}

