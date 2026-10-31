import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, AlertTriangle, UserCheck, Trash2, KeyRound, Globe, ExternalLink } from 'lucide-react';
import { LegalLayout, LegalSectionItem } from '../components/LegalLayout';
import { SeoHead } from '../../../components/seo/SeoHead';

const SECTIONS: LegalSectionItem[] = [
  { id: 'introduction', title: '1. Introduction et Responsable de Traitement' },
  { id: 'donnees-collectees', title: '2. Données Personnelles Collectées' },
  { id: 'google-oauth', title: '3. Conformité Authentification Google (OAuth)' },
  { id: 'finalites', title: '4. Finalités du Traitement' },
  { id: 'partage-destinataires', title: '5. Partage et Destinataires des Données' },
  { id: 'securite-conservation', title: '6. Sécurité et Conservation des Données' },
  { id: 'droits-utilisateurs', title: '7. Vos Droits et Droit à l\'Oubli' },
  { id: 'suppression-donnees', title: '8. Procédure de Suppression des Données' },
  { id: 'cookies-stockage', title: '9. Cookies et Stockage Local' },
  { id: 'modifications-contact', title: '10. Mises à Jour et Contact' },
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalLayout
      title="Politique de Confidentialité"
      subtitle="Engagement de Kawral pour la protection de vos données personnelles, le respect de la vie privée et la conformité aux standards Google OAuth et légaux."
      lastUpdated="29 Septembre 2026"
      icon={<Shield className="w-8 h-8 sm:w-10 sm:h-10" />}
      badgeLabel="Protection des Données & Google OAuth"
      sections={SECTIONS}
    >
      {/* 1. Introduction */}
      <SeoHead
        title="Politique de Confidentialité — Kawral Sénégal"
        description="Politique de Confidentialité de la plateforme Kawral (https://www.kawral.sn). Détail de la collecte, de l'utilisation et de la protection des données personnelles au Sénégal."
        canonicalPath="/privacy"
      />
      <section id="introduction" className="space-y-4 pt-2">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <FileText className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            1. Introduction et Responsable de Traitement
          </h2>
        </div>
        <p>
          La présente <strong>Politique de Confidentialité</strong> définit la manière dont la plateforme <strong>Kawral</strong> (ci-après désignée « Kawral », « nous », « notre » ou « nos ») collecte, utilise, protège, conserve et partage les données à caractère personnel de ses utilisateurs (acheteurs, locataires, vendeurs particuliers, agences immobilières et visiteurs).
        </p>
        <p>
          Kawral attache la plus haute importance à la protection de votre vie privée et s'engage à traiter vos données en conformité avec la réglementation sénégalaise en vigueur (notamment la <strong>Loi n° 2008-12 du 25 janvier 2008</strong> sur la protection des données à caractère personnel encadrée par la Commission de Protection des Données Personnelles - CDP) ainsi qu'avec les standards internationaux de sécurité et de confidentialité (RGPD).
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 text-slate-600">
          <p className="font-bold text-kawral-dark">Responsable du traitement :</p>
          <p>Kawral Technologies SARL — Dakar, Sénégal</p>
          <p>URL officielle du service : <a href="https://kawral.vercel.app" target="_blank" rel="noopener noreferrer" className="text-kawral-green font-bold hover:underline">https://kawral.vercel.app</a></p>
          <p>Contact Délégué à la Protection des Données : <a href="mailto:code.crafters221@gmail.com" className="text-kawral-green font-bold hover:underline">code.crafters221@gmail.com</a></p>
        </div>
      </section>

      {/* 2. Données collectées */}
      <section id="donnees-collectees" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <UserCheck className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            2. Données Personnelles Collectées
          </h2>
        </div>
        <p>
          Nous ne recueillons que les données strictement nécessaires au bon fonctionnement de la plateforme et à la sécurité de vos transactions :
        </p>
        
        <div className="space-y-3 pl-1">
          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold text-xs uppercase tracking-wider text-kawral-dark mb-1">
              A. Données d'inscription et de profil
            </h3>
            <p className="text-xs text-slate-600">
              Nom complet, adresse e-mail, numéro de téléphone (Sénégal / international), mot de passe sécurisé (chiffré), rôle sélectionné (client, vendeur particulier, agence immobilière), nom d'agence et adresse professionnelle (le cas échéant), photo de profil et bannière.
            </p>
          </div>

          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold text-xs uppercase tracking-wider text-kawral-dark mb-1">
              B. Contenu publié par l'utilisateur (Annonces)
            </h3>
            <p className="text-xs text-slate-600">
              Photographies des biens immobiliers ou véhicules, descriptions textuelles, notes vocales et descriptions audio enregistrées, localisation géographique approximative (quartier, ville, région), prix, caractéristiques techniques.
            </p>
          </div>

          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold text-xs uppercase tracking-wider text-kawral-dark mb-1">
              C. Données d'échanges et de messagerie
            </h3>
            <p className="text-xs text-slate-600">
              Messages privés échangés entre utilisateurs sur la messagerie interne Kawral, demandes de visites et rendez-vous planifiés, historique des annonces ajoutées aux favoris.
            </p>
          </div>

          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold text-xs uppercase tracking-wider text-kawral-dark mb-1">
              D. Données techniques et de sécurité
            </h3>
            <p className="text-xs text-slate-600">
              Adresse IP, type et version de navigateur, système d'exploitation, horodatage des connexions et jetons de session d'authentification (Supabase Auth).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Google OAuth Special Section */}
      <section id="google-oauth" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <KeyRound className="w-5 h-5 shrink-0 text-kawral-orange" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            3. Conformité Spécifique à l'Authentification Google (OAuth 2.0)
          </h2>
        </div>

        <p>
          Kawral propose à ses utilisateurs de se connecter ou de créer un compte via le service d'authentification <strong>Google Sign-In (OAuth 2.0)</strong>.
        </p>

        <div className="p-5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Données reçues depuis Google APIs
          </h3>
          <p className="text-xs text-blue-900 leading-relaxed">
            Lorsque vous utilisez l'authentification avec Google, Kawral accède uniquement aux données d'identité de base expressément autorisées par vous lors de l'écran de consentement Google :
          </p>
          <ul className="list-disc list-inside text-xs text-blue-900 space-y-1 pl-2">
            <li><strong>Identifiant unique Google</strong> (Google User ID) ;</li>
            <li><strong>Adresse e-mail</strong> principale associée à votre compte Google ;</li>
            <li><strong>Nom et prénom</strong> tels que configurés dans votre profil Google ;</li>
            <li><strong>Photo de profil (avatar)</strong> publique de votre compte Google.</li>
          </ul>
        </div>

        {/* Limited Use Disclosure required by Google */}
        <div className="p-5 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Clause d'Utilisation Limitée des Données Google (Google Limited Use)</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            L'utilisation et le transfert par Kawral vers toute autre application des informations reçues des API Google respecteront scrupuleusement la{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kawral-green font-bold underline inline-flex items-center gap-1"
            >
              Politique relative aux données utilisateur des services d'API Google
              <ExternalLink className="w-3 h-3" />
            </a>
            , y compris les exigences d'utilisation limitée (*Limited Use requirements*).
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <p className="font-bold text-kawral-dark">Nos garanties formelles concernant vos données Google :</p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Aucune revente de données :</strong> Vos données obtenues via Google ne sont jamais vendues, cédées, louées ou partagées avec des tiers, des courtiers de données ou des annonceurs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pas de publicité ciblée :</strong> Les données issues de Google ne sont jamais utilisées pour vous afficher des publicités ciblées ou pour effectuer du profilage commercial.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pas d'entraînement d'IA :</strong> Les données utilisateur reçues de Google ne sont jamais utilisées pour entraîner des modèles d'intelligence artificielle ou d'apprentissage automatique généralistes ou tiers.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Accès humain strictement restreint :</strong> Aucun membre de notre personnel ne lit vos données issues de Google, sauf en cas d'accord explicite pour résoudre un incident technique majeur, pour des raisons impérieuses de sécurité, ou en vertu d'une ordonnance légale.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Révocation instantanée :</strong> Vous pouvez révoquer les autorisations accordées à Kawral à tout moment depuis les <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-kawral-green font-bold underline inline-flex items-center gap-0.5">paramètres de sécurité Google <ExternalLink className="w-3 h-3" /></a>.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 4. Finalités */}
      <section id="finalites" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            4. Finalités du Traitement
          </h2>
        </div>
        <p>
          Les données collectées par Kawral sont traitées pour les finalités suivantes :
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600">
          <li>Création, authentification et administration de votre compte utilisateur ;</li>
          <li>Publication, modération et hébergement des annonces immobilières et automobiles ;</li>
          <li>Mise en relation directe entre acquéreurs, locataires, vendeurs et agences partenaires ;</li>
          <li>Fonctionnement des outils interactifs (messagerie en temps réel, prise de rendez-vous de visite, favoris) ;</li>
          <li>Prévention de la fraude, détection des annonces mensongères et protection des utilisateurs ;</li>
          <li>Envoi des notifications opérationnelles (confirmation d'inscription, validation d'annonce, rappels de rendez-vous) ;</li>
          <li>Respect des obligations légales, fiscales et réglementaires applicables au Sénégal.</li>
        </ul>
      </section>

      {/* 5. Partage et destinataires */}
      <section id="partage-destinataires" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Lock className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            5. Partage et Destinataires des Données
          </h2>
        </div>
        <p>
          Kawral ne commercialise aucune donnée personnelle. Vos informations sont partagées uniquement dans les cas strictement définis ci-après :
        </p>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="font-bold text-kawral-green">•</span>
            <span><strong>Autres utilisateurs de la plateforme :</strong> Lorsque vous publiez une annonce, son titre, son prix, sa description, sa ville et ses photos sont publics. Votre numéro de téléphone et lien WhatsApp ne sont rendus accessibles que si vous choisissez de les publier pour être contacté.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-kawral-green">•</span>
            <span><strong>Prestataires techniques et d'infrastructure :</strong> Nous faisons appel à <strong>Supabase</strong> (gestion de la base de données PostgreSQL sécurisée, stockage d'images et authentification) et à <strong>Vercel</strong> (hébergement et distribution réseau). Ces sous-traitants sont soumis à de strictes obligations de confidentialité et de conformité aux normes internationales de sécurité.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-kawral-green">•</span>
            <span><strong>Autorités judiciaires ou administratives :</strong> Uniquement en cas de réquisition judiciaire légale ou d'obligation légale impérative au Sénégal.</span>
          </li>
        </ul>
      </section>

      {/* 6. Sécurité et conservation */}
      <section id="securite-conservation" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Shield className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            6. Sécurité et Conservation des Données
          </h2>
        </div>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles rigoureuses pour protéger vos données contre tout accès non autorisé, perte, divulgation ou altération :
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600">
          <li>Toutes les communications entre votre navigateur et Kawral sont chiffrées de bout en bout via le protocole <strong>HTTPS / TLS 1.3</strong> ;</li>
          <li>Les mots de passe ne sont jamais stockés en clair et sont hachés avec des algorithmes cryptographiques robustes ;</li>
          <li>L'accès à la base de données est restreint et protégé par des politiques <em>Row Level Security</em> (RLS), garantissant qu'un utilisateur ne peut modifier que ses propres données ;</li>
          <li>Vos données sont conservées pendant toute la durée d'activation de votre compte, puis archivées ou supprimées conformément aux durées de prescription légales.</li>
        </ul>
      </section>

      {/* 7. Droits des utilisateurs */}
      <section id="droits-utilisateurs" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <UserCheck className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            7. Vos Droits et Droit à l'Oubli
          </h2>
        </div>
        <p>
          Conformément à la Loi sénégalaise n° 2008-12 et aux réglementations applicables, vous disposez des droits fondamentaux suivants sur vos données :
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-kawral-dark">Droit d'accès</p>
            <p className="text-slate-500">Obtenir la confirmation et la copie des données traitées par Kawral.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-kawral-dark">Droit de rectification</p>
            <p className="text-slate-500">Corriger à tout moment vos informations inexactes ou incomplètes.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-kawral-dark">Droit d'opposition</p>
            <p className="text-slate-500">Vous opposer au traitement de vos données pour des motifs légitimes.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-kawral-dark">Droit à l'effacement (« Droit à l'oubli »)</p>
            <p className="text-slate-500">Demander la suppression définitive de votre compte et de vos données.</p>
          </div>
        </div>
      </section>

      {/* 8. Procédure de suppression de données */}
      <section id="suppression-donnees" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-rose-600">
          <Trash2 className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            8. Procédure de Suppression des Données et de Clôture de Compte
          </h2>
        </div>
        <p>
          Kawral garantit une procédure simple, transparente et sans frais pour supprimer vos données :
        </p>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-950">
          <p className="font-bold text-sm">Comment faire une demande de suppression :</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
            <li>Envoyez un e-mail à notre adresse de support : <a href="mailto:code.crafters221@gmail.com" className="font-bold text-rose-600 underline">code.crafters221@gmail.com</a> avec pour objet <em>« Demande de suppression de compte et de données »</em> ;</li>
            <li>Indiquez l'adresse email rattachée à votre compte Kawral (ou compte Google associé) ;</li>
            <li>Notre équipe traitera la demande et procèdera à la purge définitive de votre compte, de vos annonces et de vos médias sous un délai maximal de <strong>48 heures ouvrées</strong> ;</li>
            <li>Une confirmation vous sera adressée en retour dès finalisation de l'opération.</li>
          </ol>
        </div>
      </section>

      {/* 9. Cookies */}
      <section id="cookies-stockage" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <FileText className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            9. Cookies et Stockage Local
          </h2>
        </div>
        <p>
          Kawral privilégie une expérience fluide et respectueuse de la vie privée :
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600">
          <li><strong>Cookies strictement nécessaires :</strong> Ils sont indispensables pour mémoriser votre session de connexion sécurisée (tokens Supabase Auth) et vos préférences d'affichage.</li>
          <li><strong>Aucun tracker publicitaire intrusif :</strong> Nous n'installons aucun cookie tiers publicitaire pour suivre votre navigation en dehors de Kawral.</li>
        </ul>
      </section>

      {/* 10. Modifications et contact */}
      <section id="modifications-contact" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Globe className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            10. Mises à Jour et Contact
          </h2>
        </div>
        <p>
          Kawral se réserve le droit d'actualiser la présente Politique de Confidentialité pour refléter toute évolution réglementaire ou technique. En cas de modification substantielle, vous en serez informé par notification sur la plateforme ou par email.
        </p>
        <div className="p-4 bg-kawral-ivory rounded-2xl border border-kawral-border text-xs space-y-1 text-slate-700">
          <p className="font-bold text-kawral-dark">Pour toute question ou réclamation :</p>
          <p>Kawral Technologies SARL</p>
          <p>Dakar, Sénégal</p>
          <p>E-mail : <a href="mailto:code.crafters221@gmail.com" className="font-bold text-kawral-green hover:underline">code.crafters221@gmail.com</a></p>
        </div>
      </section>
    </LegalLayout>
  );
};
