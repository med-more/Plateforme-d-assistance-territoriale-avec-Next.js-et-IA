/**
 * Service d'embedding pour générer des vecteurs à partir de texte
 * Utilise l'API Google Generative AI pour les embeddings
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface EmbeddingOptions {
  model?: string;
  taskType?: string;
}

/**
 * Génère un embedding pour un texte donné
 * Utilise l'API Google Generative AI text-embedding-004
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY n'est pas configurée");
  }

  const model = options.model || "text-embedding-004";
  const taskType = options.taskType || "RETRIEVAL_DOCUMENT";

  try {
    // Utiliser l'API REST de Google pour les embeddings
    // Format correct pour l'API v1beta
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
          taskType: taskType,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur API Google (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // L'API retourne embedding.values pour text-embedding-004
    if (data.embedding?.values) {
      return data.embedding.values;
    }
    
    // Format alternatif
    if (Array.isArray(data.embedding)) {
      return data.embedding;
    }
    
    throw new Error("Format de réponse d'embedding inattendu");
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Fallback: utiliser des embeddings simulés si l'API échoue
    console.warn("Utilisation d'embeddings simulés en fallback");
    return generateSimulatedEmbedding(text);
  }
}

/**
 * Génère des embeddings pour plusieurs textes
 */
export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
): Promise<number[][]> {
  try {
    // Générer les embeddings en parallèle (avec limite pour éviter la surcharge)
    const batchSize = 5;
    const batches: string[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    const allEmbeddings: number[][] = [];

    for (const batch of batches) {
      const batchPromises = batch.map((text) => generateEmbedding(text, options));
      const batchEmbeddings = await Promise.all(batchPromises);
      allEmbeddings.push(...batchEmbeddings);
    }

    return allEmbeddings;
  } catch (error) {
    console.error("Error generating embeddings batch:", error);
    // Fallback: embeddings simulés
    return texts.map((text) => generateSimulatedEmbedding(text));
  }
}

/**
 * Génère un embedding simulé (fallback)
 * Utilise une fonction de hachage simple pour générer des valeurs cohérentes
 */
function generateSimulatedEmbedding(text: string): number[] {
  const dimension = 384;
  const embedding: number[] = [];
  
  // Utiliser un hash simple pour générer des valeurs cohérentes
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Générer des valeurs basées sur le hash pour la cohérence
  for (let i = 0; i < dimension; i++) {
    const seed = (hash + i) * 0.001;
    embedding.push(Math.sin(seed) * 0.5);
  }

  return embedding;
}
