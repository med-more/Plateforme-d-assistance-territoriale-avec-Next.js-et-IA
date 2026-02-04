/**
 * Utilitaires pour parser et extraire des informations des documents
 */

export interface ParsedFamily {
  name: string;
  district: string;
  members: number;
  needs: string[];
  priority: "high" | "medium" | "low";
  contact?: string;
  notes?: string;
}

export interface DocumentMetadata {
  filename: string;
  type: "family_list" | "inventory" | "zakat_guide" | "other";
  extractedFamilies?: ParsedFamily[];
  extractedData?: Record<string, any>;
}

/**
 * Extrait les informations de familles depuis un texte
 * Utilise des patterns simples pour détecter les informations
 */
export function extractFamiliesFromText(text: string): ParsedFamily[] {
  const families: ParsedFamily[] = [];
  
  // Pattern 1: Format structuré "Famille [Nom] - [Quartier] - [Nombre] membres"
  const familyPattern1 = /(?:famille|family|أسرة)\s+([^\n-]+?)(?:\s*-\s*|\s+)([^\n-]+?)(?:\s*-\s*|\s+)(\d+)\s*(?:membres|members|أفراد)/gi;
  
  // Pattern 2: Format avec nom de famille suivi d'informations
  const familyPattern2 = /(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:-\s*|,)\s*([^,\n]+?)(?:,\s*|\s+)(\d+)\s*(?:membres|members|personnes|أفراد)/gim;
  
  let match;
  const processedNames = new Set<string>();
  
  // Essayer le pattern 1
  while ((match = familyPattern1.exec(text)) !== null) {
    const name = match[1].trim();
    if (processedNames.has(name)) continue;
    processedNames.add(name);
    
    const district = match[2].trim();
    const members = parseInt(match[3], 10);
    
    // Extraire les besoins depuis le contexte autour
    const contextStart = Math.max(0, match.index - 100);
    const contextEnd = Math.min(text.length, match.index + match[0].length + 300);
    const context = text.substring(contextStart, contextEnd).toLowerCase();
    
    const needs = extractNeedsFromContext(context);
    const priority = extractPriorityFromContext(context);
    
    families.push({
      name,
      district,
      members: isNaN(members) ? 0 : members,
      needs: needs.length > 0 ? needs : ["Aide générale"],
      priority,
    });
  }
  
  // Essayer le pattern 2 si le pattern 1 n'a rien trouvé
  if (families.length === 0) {
    while ((match = familyPattern2.exec(text)) !== null) {
      const name = match[1].trim();
      if (processedNames.has(name)) continue;
      processedNames.add(name);
      
      const district = match[2].trim();
      const members = parseInt(match[3], 10);
      
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(text.length, match.index + match[0].length + 300);
      const context = text.substring(contextStart, contextEnd).toLowerCase();
      
      const needs = extractNeedsFromContext(context);
      const priority = extractPriorityFromContext(context);
      
      families.push({
        name,
        district: district || "Non spécifié",
        members: isNaN(members) ? 0 : members,
        needs: needs.length > 0 ? needs : ["Aide générale"],
        priority,
      });
    }
  }
  
  // Si toujours rien, chercher des noms de familles simples
  if (families.length === 0) {
    const lines = text.split("\n").filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 5 && trimmed.length < 100;
    });
    
    lines.forEach((line) => {
      // Chercher des noms qui ressemblent à des noms de famille marocains
      const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (nameMatch && !processedNames.has(nameMatch[1])) {
        processedNames.add(nameMatch[1]);
        families.push({
          name: nameMatch[1],
          district: "Non spécifié",
          members: 0,
          needs: ["Information à compléter"],
          priority: "medium",
        });
      }
    });
  }
  
  return families;
}

/**
 * Extrait les besoins depuis un contexte de texte
 */
function extractNeedsFromContext(context: string): string[] {
  const needs: string[] = [];
  const needKeywords: Record<string, string> = {
    "quffat": "Quffat Ramadan",
    "ramadan": "Quffat Ramadan",
    "iftar": "Iftar collectif",
    "médicaments": "Médicaments",
    "medicaments": "Médicaments",
    "vêtements": "Vêtements",
    "vetements": "Vêtements",
    "éducation": "Éducation",
    "education": "Éducation",
    "logement": "Logement",
    "nourriture": "Nourriture",
    "argent": "Aide financière",
    "financier": "Aide financière",
    "scolaire": "Fournitures scolaires",
    "santé": "Soins de santé",
    "sante": "Soins de santé",
  };
  
  Object.entries(needKeywords).forEach(([keyword, label]) => {
    if (context.includes(keyword) && !needs.includes(label)) {
      needs.push(label);
    }
  });
  
  return needs;
}

/**
 * Extrait la priorité depuis un contexte de texte
 */
function extractPriorityFromContext(context: string): "high" | "medium" | "low" {
  if (context.includes("urgent") || context.includes("priorité haute") || 
      context.includes("priorite haute") || context.includes("haute priorité") ||
      context.includes("critique") || context.includes("immédiat")) {
    return "high";
  }
  
  if (context.includes("faible") || context.includes("basse") || 
      context.includes("non urgent") || context.includes("peu urgent")) {
    return "low";
  }
  
  return "medium";
}

/**
 * Détermine le type de document basé sur son contenu
 */
export function detectDocumentType(text: string, filename: string): DocumentMetadata["type"] {
  const lowerText = text.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  if (lowerText.includes("famille") || lowerText.includes("family") || lowerText.includes("أسرة") || 
      lowerFilename.includes("famille") || lowerFilename.includes("family")) {
    return "family_list";
  }
  
  if (lowerText.includes("inventaire") || lowerText.includes("inventory") || 
      lowerText.includes("stock") || lowerFilename.includes("inventaire")) {
    return "inventory";
  }
  
  if (lowerText.includes("zakat") || lowerText.includes("زكاة") || 
      lowerText.includes("guide") || lowerFilename.includes("zakat")) {
    return "zakat_guide";
  }
  
  return "other";
}

/**
 * Parse un document et extrait ses métadonnées
 */
export function parseDocument(text: string, filename: string): DocumentMetadata {
  const type = detectDocumentType(text, filename);
  const metadata: DocumentMetadata = {
    filename,
    type,
  };
  
  if (type === "family_list") {
    metadata.extractedFamilies = extractFamiliesFromText(text);
  }
  
  // Extraire d'autres données utiles
  metadata.extractedData = {
    wordCount: text.split(/\s+/).length,
    lineCount: text.split("\n").length,
    hasPhoneNumbers: /\d{10,}/.test(text),
    hasEmails: /[\w.-]+@[\w.-]+\.\w+/.test(text),
  };
  
  return metadata;
}
