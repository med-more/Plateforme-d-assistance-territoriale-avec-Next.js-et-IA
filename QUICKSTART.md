# Guide de Démarrage Rapide - Aura-Link

## 🚀 Installation en 5 minutes

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
GEMINI_API_KEY=votre_cle_gemini_ici
PINECONE_API_KEY=votre_cle_pinecone_ici
PINECONE_INDEX_NAME=casa-ramadan-2026
PINECONE_ENVIRONMENT=us-east-1
```

**Où obtenir les clés API :**

- **Gemini API** : https://makersuite.google.com/app/apikey
- **Pinecone** : https://www.pinecone.io/ (créez un compte gratuit)

### 3. Créer l'index Pinecone

1. Connectez-vous à [Pinecone Console](https://app.pinecone.io/)
2. Créez un nouvel index :
   - **Nom** : `casa-ramadan-2026`
   - **Dimensions** : `384` (ou ajustez selon votre service d'embedding)
   - **Métrique** : `cosine`
   - **Environnement** : Choisissez selon votre région (ex: `us-east-1`)

### 4. Lancer le serveur

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📝 Premiers pas

1. **Accéder au tableau de bord** : Cliquez sur "Accéder au Tableau de Bord"

2. **Importer un document** :
   - Dans la section Explorer (à droite)
   - Téléchargez un fichier PDF ou TXT
   - Le document sera automatiquement indexé dans Pinecone

3. **Poser une question** :
   - Dans la section Chat (à gauche)
   - Tapez votre question (ex: "Quelles familles ont besoin d'aide ?")
   - L'Assistant Sadaqa répondra en utilisant les documents indexés

## 🎨 Personnalisation

### Modifier les couleurs du thème

Éditez `src/app/globals.css` pour changer les couleurs Ramadan :

```css
@theme {
  --color-ramadan-lantern: #ffd700; /* Changez cette valeur */
  /* ... autres couleurs */
}
```

### Ajouter un vrai service d'embedding

Par défaut, le projet utilise des embeddings simulés. Pour utiliser un vrai service :

1. **OpenAI** : Ajoutez `OPENAI_API_KEY` dans `.env.local`
2. Modifiez `src/actions/vector-action.ts` et `src/actions/chat-action.ts`
3. Remplacez `generateEmbeddings()` par votre service

Voir le README.md pour plus de détails.

## ⚠️ Notes importantes

- Les embeddings sont **simulés** par défaut (pour la démo)
- Pour la production, intégrez un vrai service d'embedding (OpenAI, Cohere, etc.)
- Le modèle Gemini utilisé est `gemini-2.0-flash-exp` (expérimental)
- Assurez-vous que votre index Pinecone a la bonne dimension (384 par défaut)

## 🐛 Dépannage

**Erreur "API key not configured"** :
- Vérifiez que `.env.local` existe et contient les bonnes clés
- Redémarrez le serveur après avoir modifié `.env.local`

**Erreur Pinecone** :
- Vérifiez que l'index existe et a le bon nom
- Vérifiez que la dimension correspond (384 par défaut)

**Erreur Tailwind** :
- Si Tailwind v4 n'est pas disponible, utilisez Tailwind v3 avec un fichier `tailwind.config.js`

## 📚 Ressources

- [Documentation Next.js 15](https://nextjs.org/docs)
- [Documentation Gemini](https://ai.google.dev/docs)
- [Documentation Pinecone](https://docs.pinecone.io/)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

**Ramadan Kareem** 🌙✨
