# Aura-Link - Plateforme d'Assistance Territoriale Intelligente

Plateforme d'entraide citoyenne intelligente développée avec Next.js 15, Gemini Flash (Streaming) et RAG (Pinecone) pour les associations caritatives de Casablanca pendant le Ramadan.

## 🌙 Fonctionnalités

- **Assistant Sadaqa IA** : Réponses instantanées basées sur la base de connaissances de l'association
- **Gestion des Familles Nécessiteuses** : Suivi et coordination des bénéficiaires par quartier
- **Gestion des Dons** : Organisation des dons Zakat et Sadaqa
- **RAG (Retrieval-Augmented Generation)** : Recherche contextuelle dans les documents indexés
- **Streaming en Temps Réel** : Réponses streamées chunk-by-chunk pour une expérience fluide
- **Interface Moderne** : Design inspiré des couleurs du Ramadan avec Tailwind CSS v4

## 🚀 Stack Technique

- **Framework** : Next.js 15+ (App Router)
- **Styling** : Tailwind CSS v4 avec thème Ramadan personnalisé
- **UI** : Shadcn/ui (composants accessibles)
- **IA** : Google Gemini Flash 2.0 (Streaming)
- **Vector DB** : Pinecone (indexation des documents)
- **Validation** : Zod + React Hook Form
- **Animations** : Framer Motion

## 📋 Prérequis

- Node.js 18+ et npm/yarn/pnpm
- Clé API Google Gemini
- Compte Pinecone avec un index créé

## 🛠️ Installation

1. **Cloner le projet** (ou utiliser ce template)

```bash
cd ramadan
```

2. **Installer les dépendances**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**

Copiez `.env.local.example` vers `.env.local` et remplissez vos clés API :

```bash
cp .env.local.example .env.local
```

Éditez `.env.local` :

```env
GEMINI_API_KEY=votre_cle_gemini
PINECONE_API_KEY=votre_cle_pinecone
PINECONE_INDEX_NAME=casa-ramadan-2026
PINECONE_ENVIRONMENT=us-east-1
```

4. **Créer l'index Pinecone**

- Connectez-vous à [Pinecone](https://www.pinecone.io/)
- Créez un nouvel index nommé `casa-ramadan-2026`
- Dimension : 384 (ou ajustez selon votre service d'embedding)
- Métrique : cosine

5. **Lancer le serveur de développement**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout avec slots parallèles
│   │   ├── @chat/
│   │   │   ├── page.tsx        # Interface de conversation IA
│   │   │   └── loading.tsx     # État de chargement du chat
│   │   └── @explorer/
│   │       ├── page.tsx        # Analyse des listes de familles
│   │       └── loading.tsx     # État de chargement de l'explorer
│   ├── layout.tsx              # Layout racine
│   ├── page.tsx                # Page d'accueil
│   └── globals.css             # Styles Tailwind v4 avec thème Ramadan
├── components/
│   ├── context/
│   │   └── sadaqa-context.tsx  # Gestion de l'état global
│   └── ui/                     # Composants Shadcn/ui
├── actions/
│   ├── vector-action.ts        # Server Action pour Pinecone
│   └── chat-action.ts          # Server Action pour Gemini (streaming)
└── lib/
    └── validators/
        └── form-schema.ts      # Schémas Zod
```

## 🎨 Thème Ramadan

Le projet utilise un thème de couleurs personnalisé inspiré des lanternes du Ramadan et des couleurs du Souss :

- **Ramadan Gold** : `#d4af37`
- **Ramadan Amber** : `#ff8c00`
- **Ramadan Lantern** : `#ffd700`
- **Deep Blue** : `#1a1f3a`
- **Night** : `#0f1419`

Les couleurs sont définies dans `src/app/globals.css` via les variables `@theme` de Tailwind v4.

## 🔧 Configuration Avancée

### Utiliser un Vrai Service d'Embedding

Par défaut, le projet utilise des embeddings simulés. Pour utiliser un vrai service :

1. **OpenAI Embeddings** :

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks,
  });
  return response.data.map((item) => item.embedding);
}
```

2. **Cohere Embeddings** :

```typescript
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const response = await cohere.embed({
    texts: chunks,
    model: "embed-english-v3.0",
    inputType: "search_document",
  });
  return response.embeddings;
}
```

Mettez à jour `vector-action.ts` et `chat-action.ts` avec votre service d'embedding.

## 📝 Utilisation

1. **Accéder au Tableau de Bord** : Cliquez sur "Accéder au Tableau de Bord" depuis la page d'accueil

2. **Importer des Documents** : Dans l'onglet Explorer, téléchargez des PDFs ou fichiers TXT contenant :
   - Listes de familles nécessiteuses
   - Inventaires de denrées
   - Guides de Zakat
   - Plannings de distribution

3. **Poser des Questions** : Dans l'onglet Chat, posez des questions à l'Assistant Sadaqa :
   - "Quelles familles ont besoin de Quffat Ramadan dans Hay Hassani ?"
   - "Combien de familles sont enregistrées ?"
   - "Quels sont les besoins prioritaires ce mois ?"

## 🎯 Fonctionnalités Futures

- [ ] Intégration avec un vrai service d'embedding (OpenAI, Cohere)
- [ ] Export des données en PDF/Excel
- [ ] Tableau de bord analytique
- [ ] Notifications en temps réel
- [ ] Multi-utilisateurs avec authentification
- [ ] API REST pour intégrations externes

## 📄 Licence

Ce projet est développé pour les associations caritatives de Casablanca.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Ramadan Kareem** 🌙✨
