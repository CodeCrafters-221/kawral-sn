import React from 'react';
import { FileText, CheckCircle2, ShieldAlert, Scale, AlertTriangle, Building, UserCheck, ShieldCheck, Mail, Globe } from 'lucide-react';
import { LegalLayout, LegalSectionItem } from '../components/LegalLayout';

const SECTIONS: LegalSectionItem[] = [
  { id: 'objet', title: '1. Objet et Présentation de la Plateforme' },
  { id: 'acceptation', title: '2. Acceptation et Opposabilité des CGU' },
  { id: 'acces-compte', title: '3. Accès au Service et Création de Compte' },
  { id: 'regles-annonces', title: '4. Règles de Publication des Annonces' },
  { id: 'engagements-utilisateurs', title: '5. Engagements et Comportements Prohibés' },
  { id: 'responsabilite-kawral', title: '6. Rôle et Limitation de Responsabilité' },
  { id: 'propriete-intellectuelle', title: '7. Propriété Intellectuelle' },
  { id: 'moderation-sanctions', title: '8. Modération, Suspension et Résiliation' },
  { id: 'loi-juridiction', title: '9. Droit Applicable et Juridiction Compétente' },
  { id: 'contact-assistance', title: '10. Contact et Assistance' },
];

export const TermsOfServicePage: React.FC = () => {
  return (
    <LegalLayout
      title="Conditions Générales d'Utilisation (CGU)"
      subtitle="Règles d'utilisation de la plateforme Kawral pour la publication, la recherche et la mise en relation immobilière et automobile au Sénégal."
      lastUpdated="29 Septembre 2026"
      icon={<FileText className="w-8 h-8 sm:w-10 sm:h-10" />}
      badgeLabel="Cadre Contractuel Officiel"
      sections={SECTIONS}
    >
      {/* 1. Objet */}
      <section id="objet" className="space-y-4 pt-2">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Building className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            1. Objet et Présentation de la Plateforme
          </h2>
        </div>
        <p>
          Les présentes <strong>Conditions Générales d'Utilisation</strong> (ci-après « CGU ») encadrent l'accès et l'utilisation de la plateforme numérique <strong>Kawral</strong>, accessible en ligne et sur application web.
        </p>
        <p>
          Kawral est une plateforme technologique sénégalaise dédiée à l'immobilier et à l'automobile, facilitant la mise en relation directe entre des acheteurs ou locataires potentiels et des annonceurs (particuliers propriétaires, vendeurs professionnels et agences immobilières agréées).
        </p>
        <p>
          L'éditeur de la plateforme est <strong>Kawral Technologies SARL</strong>, société de droit sénégalais ayant son siège à Dakar (Sénégal). E-mail de contact : <a href="mailto:code.crafters221@gmail.com" className="font-bold text-kawral-green hover:underline">code.crafters221@gmail.com</a>.
        </p>
      </section>

      {/* 2. Acceptation */}
      <section id="acceptation" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            2. Acceptation et Opposabilité des CGU
          </h2>
        </div>
        <p>
          Tout accès, navigation, consultation ou inscription sur Kawral implique l'acceptation expresse, sans réserve ni restriction, des présentes CGU par l'utilisateur.
        </p>
        <p>
          Si vous n'acceptez pas tout ou partie des présentes conditions, vous devez renoncer immédiatement à l'utilisation des services de Kawral. Kawral se réserve la faculté de modifier à tout moment les présentes conditions afin de s'adapter aux évolutions techniques, légales ou jurisprudentielles.
        </p>
      </section>

      {/* 3. Accès au service et création de compte */}
      <section id="acces-compte" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <UserCheck className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            3. Accès au Service et Création de Compte
          </h2>
        </div>
        <p>
          La consultation publique des annonces est ouverte à tous les internautes. En revanche, la publication d'annonces, l'enregistrement de favoris, l'utilisation de la messagerie interne et la planification de rendez-vous requièrent la création préalable d'un compte utilisateur.
        </p>

        <div className="space-y-3 pl-1 text-xs">
          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold uppercase tracking-wider text-kawral-dark mb-1">
              Capacité et éligibilité
            </h3>
            <p className="text-slate-600">
              L'utilisateur doit être une personne physique âgée d'au moins 18 ans ou disposer de la pleine capacité juridique pour s'engager, ou une personne morale régulièrement immatriculée (pour les agences et professionnels).
            </p>
          </div>

          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold uppercase tracking-wider text-kawral-dark mb-1">
              Modes d'authentification (Email & Google OAuth)
            </h3>
            <p className="text-slate-600">
              L'inscription peut être réalisée soit par e-mail avec mot de passe sécurisé, soit via le protocole Google Sign-In (OAuth). L'utilisateur s'engage à fournir des informations véridiques, complètes et à jour.
            </p>
          </div>

          <div className="p-3.5 bg-kawral-ivory/60 rounded-xl border border-kawral-border/60">
            <h3 className="font-bold uppercase tracking-wider text-kawral-dark mb-1">
              Sécurité des identifiants
            </h3>
            <p className="text-slate-600">
              L'utilisateur est personnellement responsable de la préservation de la confidentialité de ses accès. Toute action réalisée depuis son compte est présumée émaner de lui-même. En cas de perte ou compromission de son mot de passe, il doit immédiatement utiliser la procédure de réinitialisation ou avertir notre support technique.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Règles de publication des annonces */}
      <section id="regles-annonces" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <FileText className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            4. Règles de Publication des Annonces
          </h2>
        </div>
        <p>
          Pour garantir la fiabilité et le sérieux des transactions sur Kawral, tout annonceur (vendeur particulier ou agence) s'engage formellement à respecter les critères suivants :
        </p>

        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Droit et légitimité :</strong> L'annonceur certifie être le propriétaire légitime du bien ou du véhicule, ou détenir un mandat écrit de vente ou de gestion locative valide délivré par le propriétaire.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Exactitude des informations :</strong> Les caractéristiques (surface, pièces, année, kilométrage, titre de propriété, localisation) et le prix affiché en Francs CFA doivent refléter strictement la réalité.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Authenticité des médias :</strong> Les photos téléversées doivent représenter fidèlement le bien ou véhicule en question. Sont prohibées les photos volées sur internet ou portant atteinte aux droits de tiers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Notes vocales et descriptions audio :</strong> Les enregistrements vocaux intégrés aux annonces doivent être professionnels, respectueux et strictement dédiés à la description du bien.</span>
          </li>
        </ul>
      </section>

      {/* 5. Comportements prohibés */}
      <section id="engagements-utilisateurs" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-rose-600">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            5. Engagements des Utilisateurs et Comportements Prohibés
          </h2>
        </div>
        <p>
          Sont formellement interdits sur la plateforme sous peine de bannissement immédiat et de poursuites judiciaires :
        </p>

        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs space-y-1.5 text-rose-950">
          <p className="font-bold flex items-center gap-1.5 text-rose-700">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Pratiques strictement interdites :
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
            <li>Toute tentative d'escroquerie, de fraude ou d'exigence d'avances monétaires non sécurisées sans visite préalable ou sans acte officiel ;</li>
            <li>La publication d'annonces fictives, d'annonces dupliquées à des fins de spam ou d'annonces relatives à des biens sous litige foncier avéré ;</li>
            <li>L'usurpation d'identité ou la présentation indue comme agence immobilière agréée sans statut légal ;</li>
            <li>Tout comportement injurieux, diffamatoire ou contraire aux bonnes mœurs dans la messagerie ou les descriptions d'annonces ;</li>
            <li>Toute tentative d'extraction automatisée (scraping), de décompilation ou d'atteinte à l'intégrité technique de la plateforme.</li>
          </ul>
        </div>
      </section>

      {/* 6. Rôle et limitation de responsabilité */}
      <section id="responsabilite-kawral" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Scale className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            6. Rôle et Limitation de Responsabilité de Kawral
          </h2>
        </div>
        <p>
          Il est expressément rappelé que <strong>Kawral intervient en qualité de plateforme technique d'hébergement et d'intermédiation</strong> au sens du droit applicable :
        </p>

        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="font-bold text-kawral-green">•</span>
            <span><strong>Absence de partie aux contrats finaux :</strong> Sauf accord d'accompagnement spécifique, Kawral n'est pas partie prenante aux contrats de vente, de location ou de réservation conclus hors ligne entre acheteurs, locataires et annonceurs.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-kawral-green">•</span>
            <span><strong>Devoir de vigilance des utilisateurs :</strong> Kawral recommande vivement d'effectuer systématiquement une visite physique des lieux ou du véhicule, de vérifier l'état civil de l'interlocuteur et de solliciter les conseils d'un notaire ou professionnel du droit avant tout paiement.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-kawral-green">•</span>
            <span><strong>Disponibilité de la plateforme :</strong> Kawral met en œuvre ses meilleurs efforts pour assurer une disponibilité 24h/24 et 7j/7, mais ne saurait être tenue responsable des interruptions pour maintenance, défaillance des réseaux télécoms ou cas de force majeure.</span>
          </li>
        </ul>
      </section>

      {/* 7. Propriété intellectuelle */}
      <section id="propriete-intellectuelle" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            7. Propriété Intellectuelle
          </h2>
        </div>
        <p>
          L'ensemble des éléments constituant la plateforme Kawral (code source, algorithmes, architecture, nom commercial, marques, logos, chartes graphiques, maquettes et bases de données) est la propriété exclusive de Kawral Technologies SARL.
        </p>
        <p className="text-xs text-slate-600">
          En téléversant des photos ou des contenus sur la plateforme, l'utilisateur concède à Kawral une licence non exclusive, gratuite et mondiale de reproduction et d'affichage de ces contenus aux seules fins d'exploitation et de promotion de l'annonce sur le service Kawral.
        </p>
      </section>

      {/* 8. Modération et résiliation */}
      <section id="moderation-sanctions" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            8. Modération, Suspension et Résiliation
          </h2>
        </div>
        <p>
          Kawral dispose d'un système de signalement communautaire et d'une équipe de modération active :
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600">
          <li>Kawral se réserve le droit de refuser, suspendre ou supprimer sans préavis toute annonce non conforme aux présentes CGU ou faisant l'objet de signalements motivés ;</li>
          <li>En cas d'infraction grave ou répétée, le compte de l'utilisateur pourra être immédiatement clôturé, sans préjudice de poursuites civiles ou pénales ;</li>
          <li>L'utilisateur peut à tout moment résilier son compte en contactant le support technique.</li>
        </ul>
      </section>

      {/* 9. Droit applicable */}
      <section id="loi-juridiction" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Scale className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            9. Droit Applicable et Juridiction Compétente
          </h2>
        </div>
        <p>
          Les présentes CGU sont régies, interprétées et appliquées conformément aux <strong>lois de la République du Sénégal</strong> et aux dispositions du droit commercial <strong>OHADA</strong>.
        </p>
        <p>
          En cas de contestation ou de litige relatif à l'interprétation ou à l'exécution des présentes conditions, les parties s'engagent à rechercher prioritairement un règlement amiable. À défaut d'accord amiable sous trente (30) jours, attribution expresse de compétence est conférée aux <strong>tribunaux compétents de Dakar (Sénégal)</strong>.
        </p>
      </section>

      {/* 10. Contact */}
      <section id="contact-assistance" className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 text-kawral-green">
          <Globe className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-kawral-dark">
            10. Contact et Assistance
          </h2>
        </div>
        <p>
          Pour toute question, demande de clarification ou signalement d'un contenu illicite, notre service juridique et support est joignable :
        </p>
        <div className="p-4 bg-kawral-ivory rounded-2xl border border-kawral-border text-xs space-y-1 text-slate-700">
          <p className="font-bold text-kawral-dark">Kawral Technologies SARL</p>
          <p>Dakar, Sénégal</p>
          <p>E-mail : <a href="mailto:code.crafters221@gmail.com" className="font-bold text-kawral-green hover:underline">code.crafters221@gmail.com</a></p>
        </div>
      </section>
    </LegalLayout>
  );
};
