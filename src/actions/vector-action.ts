"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import pdf from "pdf-parse";
import * as XLSX from "xlsx";
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
    const fileName = file.name.toLowerCase();
    let extractedFamilies: ExtractedFamily[] | undefined;

    // Détecter le type de fichier par extension si le type MIME n'est pas fiable
    const isExcel = 
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");

    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (file.type === "text/plain" || fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else if (isExcel) {
      // Lire le fichier Excel une seule fois
      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(arrayBuffer, { type: "array" });
      } catch (excelError) {
        console.error("Error reading Excel file:", excelError);
        return {
          success: false,
          error: `Erreur lors de la lecture du fichier Excel: ${excelError instanceof Error ? excelError.message : "Erreur inconnue"}`,
        };
      }

      // Extraire les familles directement depuis la structure Excel (avant de convertir en texte)
      try {
        extractedFamilies = extractFamiliesFromExcel(workbook);
        console.log(`Extracted ${extractedFamilies?.length || 0} families from Excel file structure`);
      } catch (error) {
        console.error("Error extracting families from Excel:", error);
        // Continuer avec le parsing de texte normal
      }

      // Convertir en texte pour l'indexation
      const textParts: string[] = [];
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        // Convertir la feuille en JSON pour extraire les données
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        // Convertir en texte formaté
        jsonData.forEach((row: any) => {
          if (Array.isArray(row)) {
            const rowText = row
              .filter((cell) => cell !== null && cell !== undefined && cell !== "")
              .map((cell) => String(cell).trim())
              .join(" | ");
            if (rowText) {
              textParts.push(rowText);
            }
          }
        });
      });

      text = textParts.join("\n");
      
      // Si le texte est vide, essayer une autre méthode
      if (!text || text.trim().length === 0) {
        // Essayer de convertir directement en CSV puis en texte
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          if (csv) {
            textParts.push(`Feuille: ${sheetName}\n${csv}`);
          }
        });
        text = textParts.join("\n\n");
      }
    } else {
      return {
        success: false,
        error: "Type de fichier non supporté. Formats acceptés: PDF, TXT, XLSX, XLS",
      };
    }

    // Parser le document pour extraire les métadonnées
    const documentMetadata = parseDocument(text, file.name);
    
    // Si on a extrait des familles depuis Excel, les utiliser (priorité sur le parsing de texte)
    if (extractedFamilies && extractedFamilies.length > 0) {
      documentMetadata.extractedFamilies = extractedFamilies.map(f => ({
        name: f.name,
        district: f.district,
        members: f.members,
        needs: f.needs,
        priority: f.priority,
      }));
      console.log(`Using ${extractedFamilies.length} families extracted from Excel structure`);
    } else if (documentMetadata.extractedFamilies && documentMetadata.extractedFamilies.length > 0) {
      console.log(`Using ${documentMetadata.extractedFamilies.length} families extracted from text parsing`);
    }

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
 * Extrait les familles directement depuis un fichier Excel structuré
 */
function extractFamiliesFromExcel(workbook: XLSX.WorkBook): ExtractedFamily[] {
  const families: ExtractedFamily[] = [];
  
  // Parcourir toutes les feuilles
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    
    // Essayer d'abord avec des en-têtes (première ligne)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: "",
      raw: false 
    }) as any[][];
    
    if (jsonData.length < 2) return; // Pas assez de données
    
    // Trouver les indices des colonnes pertinentes
    const headerRow = jsonData[0].map((cell: any) => String(cell).toLowerCase().trim());
    
    // Chercher les colonnes possibles
    const nameColIndex = findColumnIndex(headerRow, ["nom", "name", "famille", "family", "أسرة"]);
    const districtColIndex = findColumnIndex(headerRow, ["quartier", "district", "zone", "حي", "region"]);
    const membersColIndex = findColumnIndex(headerRow, ["membres", "members", "personnes", "أفراد", "nombre"]);
    const needsColIndex = findColumnIndex(headerRow, ["besoins", "needs", "besoin", "احتياجات"]);
    const priorityColIndex = findColumnIndex(headerRow, ["priorité", "priority", "urgence", "أولوية"]);
    
    // Si on a au moins un nom, on peut extraire
    if (nameColIndex === -1) {
      // Essayer sans en-têtes - format simple
      extractFamiliesFromSimpleExcel(jsonData, families);
      return;
    }
    
    // Extraire les données ligne par ligne
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const name = String(row[nameColIndex] || "").trim();
      if (!name || name.length < 2) continue; // Ignorer les lignes vides
      
      const district = districtColIndex >= 0 ? String(row[districtColIndex] || "").trim() : "Non spécifié";
      const membersStr = membersColIndex >= 0 ? String(row[membersColIndex] || "0") : "0";
      const members = parseInt(membersStr.replace(/\D/g, ""), 10) || 0;
      
      // Extraire les besoins
      let needs: string[] = [];
      if (needsColIndex >= 0) {
        const needsStr = String(row[needsColIndex] || "").trim();
        if (needsStr) {
          needs = needsStr.split(/[,;|]/).map(n => n.trim()).filter(n => n.length > 0);
        }
      }
      if (needs.length === 0) {
        needs = ["Aide générale"];
      }
      
      // Déterminer la priorité
      let priority: "high" | "medium" | "low" = "medium";
      if (priorityColIndex >= 0) {
        const priorityStr = String(row[priorityColIndex] || "").toLowerCase().trim();
        if (priorityStr.includes("haute") || priorityStr.includes("high") || priorityStr.includes("urgent")) {
          priority = "high";
        } else if (priorityStr.includes("basse") || priorityStr.includes("low") || priorityStr.includes("faible")) {
          priority = "low";
        }
      }
      
      families.push({
        name,
        district: district || "Non spécifié",
        members,
        needs,
        priority,
      });
    }
  });
  
  return families;
}

/**
 * Trouve l'index d'une colonne basé sur des mots-clés possibles
 */
function findColumnIndex(headerRow: string[], keywords: string[]): number {
  for (let i = 0; i < headerRow.length; i++) {
    const cell = headerRow[i];
    if (keywords.some(keyword => cell.includes(keyword))) {
      return i;
    }
  }
  return -1;
}

/**
 * Extrait les familles depuis un format Excel simple sans en-têtes
 */
function extractFamiliesFromSimpleExcel(jsonData: any[][], families: ExtractedFamily[]): void {
  // Chercher des patterns dans les données
  jsonData.forEach((row, index) => {
    if (!row || row.length === 0) return;
    
    // Chercher un nom (première colonne non vide qui ressemble à un nom)
    let name = "";
    let district = "Non spécifié";
    let members = 0;
    
    for (let i = 0; i < row.length; i++) {
      const cell = String(row[i] || "").trim();
      if (!cell) continue;
      
      // Si c'est un nom (commence par une majuscule, 2+ mots)
      if (!name && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/.test(cell)) {
        name = cell;
      }
      // Si c'est un nombre, probablement le nombre de membres
      else if (members === 0 && /^\d+$/.test(cell)) {
        members = parseInt(cell, 10);
      }
      // Sinon, pourrait être le quartier
      else if (district === "Non spécifié" && cell.length > 2 && cell.length < 30) {
        district = cell;
      }
    }
    
    if (name && name.length > 2) {
      families.push({
        name,
        district,
        members: members || 0,
        needs: ["Aide générale"],
        priority: "medium",
      });
    }
  });
}

/**
 * Divise le texte en chunks avec overlap pour améliorer la récupération contextuelle
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  
  // Validation des paramètres
  if (chunkSize <= 0) {
    throw new Error("chunkSize doit être supérieur à 0");
  }
  
  if (overlap < 0) {
    overlap = 0;
  }
  
  // S'assurer que overlap est inférieur à chunkSize pour éviter les boucles infinies
  if (overlap >= chunkSize) {
    overlap = Math.floor(chunkSize * 0.2); // Utiliser 20% de chunkSize comme overlap par défaut
  }

  // Nettoyer le texte (supprimer les espaces multiples, sauts de ligne excessifs)
  const cleanedText = text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Si le texte est vide, retourner un tableau vide
  if (cleanedText.length === 0) {
    return chunks;
  }

  let start = 0;
  const maxChunks = 10000; // Limite de sécurité pour éviter les tableaux trop grands
  let iterations = 0;

  while (start < cleanedText.length && chunks.length < maxChunks && iterations < maxChunks * 2) {
    iterations++;
    
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.slice(start, end).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Calculer la position de départ pour le prochain chunk
    const nextStart = end - overlap;
    
    // S'assurer que nextStart progresse toujours
    if (nextStart <= start) {
      // Si nextStart n'a pas progressé, avancer d'au moins 1 caractère
      start = start + 1;
    } else {
      start = nextStart;
    }
    
    // Sécurité supplémentaire : si on n'a pas progressé, sortir de la boucle
    if (start >= cleanedText.length) {
      break;
    }
  }

  // Avertir si on a atteint la limite
  if (chunks.length >= maxChunks) {
    console.warn(`Limite de ${maxChunks} chunks atteinte. Le texte a été tronqué.`);
  }

  return chunks;
}
