import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../../../components/seo/SeoHead';

export const NotFoundPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 pb-20 text-center space-y-4">
    <SeoHead
      title="Page introuvable (404) | Kawral"
      description="La page que vous recherchez n'existe pas ou a été déplacée sur Kawral Sénégal."
      noIndex={true}
    />
    <p className="text-sm font-bold text-kawral-orange">Erreur 404</p>
    <h1 className="text-3xl font-extrabold">Page introuvable</h1>
    <Link to="/" className="inline-block bg-kawral-green text-white px-5 py-3 rounded-xl text-sm font-bold">
      Retour à l’accueil
    </Link>
  </div>
);
