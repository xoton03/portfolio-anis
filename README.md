# Portfolio Professionnel Interactif - Anis Sayah

Ce projet est un portfolio web mono-page (Single Page Application - SPA) somptueux, fluide et interactif, conçu pour présenter vos compétences et vos projets aux recruteurs.

L'interface utilisateur s'appuie sur un design **sombre, épuré et moderne (Glassmorphism)** avec des effets de lueurs colorées (bleu électrique et vert émeraude) et des animations au défilement (scroll reveals).

Il comprend également un **panneau d'administration sécurisé en direct**, alimenté par **Supabase**. Lorsqu'il est connecté, le propriétaire du site peut ajouter, modifier ou supprimer des projets, et modifier son profil (textes, compétences, CV, avatar) directement sur la page.

---

## 🛠️ Configuration de Supabase (Étape Obligatoire)

Pour faire fonctionner le portfolio avec votre propre base de données, vous devez créer les tables et configurer la sécurité RLS.

### Script SQL de configuration

1. Rendez-vous sur votre console [Supabase](https://supabase.com).
2. Ouvrez votre projet (`jphzmgscxpejcyjlnspq`).
3. Allez dans l'onglet **SQL Editor** dans le menu latéral gauche.
4. Cliquez sur **New query**.
5. Copiez et collez le script SQL ci-dessous, puis cliquez sur le bouton **Run** (Exécuter) :

```sql
-- 1. Table de profil de l'utilisateur (limité à une seule ligne)
CREATE TABLE IF NOT EXISTS portfolio_profile (
    id INT PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    avatar_url TEXT,
    skills TEXT[] NOT NULL,
    cv_url TEXT,
    email TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT one_row CHECK (id = 1)
);

-- 2. Table des projets
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL, -- Contenu en Markdown pour la page dédiée
    image_url TEXT,
    tags TEXT[] NOT NULL,
    demo_url TEXT,
    github_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des messages de contact (pour recevoir les messages des recruteurs)
CREATE TABLE IF NOT EXISTS portfolio_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ACTIVATION DE LA SÉCURITÉ (RLS)
-- ==========================================
ALTER TABLE portfolio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour le profil
CREATE POLICY "Allow public read of profile" ON portfolio_profile FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update of profile" ON portfolio_profile FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated insert of profile" ON portfolio_profile FOR INSERT TO authenticated WITH CHECK (true);

-- Politiques pour les projets
CREATE POLICY "Allow public read of projects" ON portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert of projects" ON portfolio_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update of projects" ON portfolio_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete of projects" ON portfolio_projects FOR DELETE TO authenticated USING (true);

-- Politiques pour les messages (Le public peut écrire, seul l'admin connecté peut lire)
CREATE POLICY "Allow public insert of messages" ON portfolio_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select of messages" ON portfolio_messages FOR SELECT TO authenticated USING (true);

-- ==========================================
-- INSERTION DES DONNÉES PAR DÉFAUT
-- ==========================================

-- Insertion du profil par défaut (Anis Sayah)
INSERT INTO portfolio_profile (id, name, title, bio, avatar_url, skills, email, github_url, linkedin_url)
VALUES (
    1,
    'Anis Sayah',
    'Where Marketing Strategy Meets Clean Code.',
    'I bridge the gap between user acquisition and technical execution. Specializing in Flutter Web and robust backend architectures to deliver seamless, conversion-focused digital experiences.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD-EWCzR_5VX5Ec-BzPE5XVEHPMlEviGhQ_pl0TKArZC3nAMPMSdTBV5CuazYm-pcTrnE5ObIGLCPMSHGb1aFTIE-4YjD5Sl2zC-PrDUpLWhsLztifc2DaOUGoM4DyNLkiCji8vI2ZgV-y06CVV9FMRreZT3_u_uBxkDKgCv_kIWgs1b3isNB3MR1TYbWCacQOLOGZcdDI_B9FAr6jaB2TWjF1-bxIlRLEU3_v2kvFxMY0amMc2Rl8REQfWZ5VoY1nAQK393_JYk3Z2',
    ARRAY['Flutter', 'Dart', 'Firebase', 'SQLite', 'System Design', 'Marketing Strategy'],
    'sayahanis2003@gmail.com',
    'https://github.com/xoton03',
    'https://www.linkedin.com/in/sayah-anis-6a85a13aa'
) ON CONFLICT (id) DO NOTHING;

-- Insertion des projets par défaut
INSERT INTO portfolio_projects (title, subtitle, description, content, image_url, tags, featured)
VALUES (
    'TagUp',
    'Featured Project',
    'A comprehensive retail inventory management platform engineered with a complex database architecture. Features include real-time stock tracking, persistent custom theming, and an intuitive UI.',
    '# TagUp: Gestion de Stock Intelligente

TagUp est une solution complète de gestion des stocks conçue pour la distribution physique.

## Caractéristiques Clés
- **Suivi en temps réel** : Synchronisation immédiate des niveaux de stock via Supabase Realtime.
- **Interface Glassmorphique** : Design sombre ultra-moderne conçu pour minimiser la fatigue visuelle du personnel.
- **Mode Hors-ligne** : Cache SQLite permettant de scanner et modifier même sans connexion internet.

## Stack Technique
- Flutter Web
- Supabase (PostgreSQL, Realtime)
- SQLite (cache local)',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDFSS2H70c0inTn228V7HLNf3EnlSX8i8E4qkPOXyJfm1Zw9M3wQRmMF2p7jyF5UpxSBXHNeS379O_k1ldhrEzRX3Lm1RQdBaQOIRak4FSovYg62cCLz3LmbdXICIdvWCZlzk1bS_fxD2e0ihckqpXb6heo6cFCdCemyjdH-sj41O1tsLVxKaNpK18jYdtijUxPstJtrfDH3RVu72c_Fmbmcvx_lU6FaYWRWXSF_kYBANflA2hmuzBDz2kSShOTcakEgZseVqWC2cU4',
    ARRAY['Flutter Web', 'Firebase', 'State Mgmt'],
    true
),
(
    'MarketFlow',
    'Analytics Dashboard',
    'An analytics aggregation tool that translates raw marketing data into actionable, visual insights using custom Dart charting libraries.',
    '# MarketFlow: Tableau de bord d''analyses Marketing

MarketFlow agrège les données issues de Google Ads, Meta Ads et TikTok Ads dans un dashboard unifié.

## Caractéristiques Clés
- **Connecteurs personnalisés** : Import automatique de vos campagnes en un clic.
- **Librairie graphique personnalisée** : Graphiques hautes performances optimisés pour de grands volumes de données.
- **Rapports Automatiques** : Génération de synthèses PDF hebdomadaires.

## Stack Technique
- Dart
- SQLite
- Tailwind CSS',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCoT5_BHDOcjJHC-uB3kYI5QPLeYfryUHX53vfASbVb0-wruYiFOKAWF-b5z51C8UO0eikoOuqfnTclYTH-TYnDgHiMbvyU5sTMuwqyNh7g6-Soz0oYl5dKUedP76hhH5ojHjdad7mO8tfsH73VkGvlaohbuI2WCYzKLrS4a1mLTLmXSkSFlk-sMeOfShhJrmLmSqQmZPoRhAFizHRMsAAsCtygU1bgDGB9kRk4IfdQ5wFuY0LvjPFSzsB0jMFJ25NLrdLDrysRavBS',
    ARRAY['Dart', 'SQLite'],
    false
) ON CONFLICT DO NOTHING;
```

---

## 🔒 Comment se connecter en Administrateur ?

1. Sur le portfolio, faites défiler la page tout en bas et cliquez sur l'icône de cadenas **Admin** ou le lien d'administration situé dans la barre de navigation ou le pied de page.
2. Saisissez votre adresse e-mail administrateur (`sayahanis2003@gmail.com`) ainsi que le mot de passe défini lors de la création de l'utilisateur dans Supabase Auth.
3. Une fois connecté, vous verrez une **bannière bleue en haut de page** signalant que le **Mode Éditeur** est actif.
4. Vous pouvez alors :
   - Cliquer directement sur votre **nom**, le **titre principal** ou la **bio** pour les modifier (modification en direct à l'écran, enregistrée automatiquement lorsque vous cliquez en dehors du texte).
   - Cliquer sur le bouton d'édition de l'image de profil pour changer son URL.
   - Cliquer sur **Modifier les compétences** pour éditer vos compétences (une par ligne).
   - Modifier le lien de téléchargement de votre CV et vos réseaux sociaux.
   - Cliquer sur **Nouveau Projet** pour ajouter une réalisation (avec support Markdown pour rédiger l'étude de cas détaillée).
   - Cliquer sur les icônes d'édition (stylo) et de suppression (corbeille) sur chaque carte de projet pour les modifier ou les retirer.

---

## 🗄️ Configuration du Stockage Supabase (Storage)

Pour pouvoir importer vos images (avatar de profil et images de couverture des projets) directement depuis votre ordinateur sans avoir à copier-coller des URLs de l'internet :

1. Allez sur votre tableau de bord **Supabase** et cliquez sur **Storage** dans la barre latérale gauche.
2. Cliquez sur **New Bucket** (Nouveau compartiment).
3. Nommez le bucket **`portfolio`**.
4. Cochez l'option **Public Bucket** (Compartiment public) pour que tout le monde puisse afficher vos images.
5. Cliquez sur **Save**.
6. Cliquez sur **Policies** (Politiques de sécurité) pour le bucket `portfolio`.
7. Sous **Object policies**, cliquez sur **New Policy** et créez une politique permettant les actions suivantes :
   - Autoriser l'action **SELECT** (Lecture) pour tout le monde (public).
   - Autoriser les actions **INSERT**, **UPDATE** et **DELETE** (Écritures) uniquement pour les utilisateurs connectés (**authenticated**).
   *Note : Vous pouvez utiliser le modèle prédéfini "Give users access to only upload files to a bucket" ou simplement autoriser toutes les opérations au rôle `authenticated`.*

---

## 🚀 Déploiement sur GitHub Pages (Gratuit)

Le portfolio étant composé de fichiers statiques purs, son déploiement sur GitHub Pages se fait en quelques clics :

1. Créez un nouveau dépôt public (ex. `portfolio`) sur votre compte GitHub.
2. Initialisez Git dans votre dossier local, ajoutez les fichiers et effectuez un commit :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Liez et poussez les fichiers sur votre dépôt GitHub :
   ```bash
   git remote add origin https://github.com/VOTRE_PSEUDO/portfolio.git
   git branch -M main
   git push -u origin main
   ```
4. Sur GitHub, allez dans les **Settings** (Paramètres) de votre dépôt.
5. Dans le menu de gauche, cliquez sur **Pages**.
6. Sous la section **Build and deployment**, configurez la source sur **Deploy from a branch**.
7. Choisissez la branche `main` et le dossier `/ (root)`, puis cliquez sur **Save** (Enregistrer).
8. Votre site sera en ligne à l'adresse : `https://VOTRE_PSEUDO.github.io/portfolio/` sous quelques minutes !
