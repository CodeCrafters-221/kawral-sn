import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ListingGrid } from '../../../components/marketplace/ListingGrid';

export const FavoritesPage: React.FC = () => {
  const { favorites, listings } = useApp();
  const favoriteListings = listings.filter((listing) => favorites.includes(listing.id));

  if (favoriteListings.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 md:pt-10 pb-20 text-center space-y-4">
        <Heart className="w-12 h-12 mx-auto text-kawral-orange" />
        <h1 className="text-2xl font-extrabold">Aucun favori pour le moment</h1>
        <p className="text-sm text-kawral-muted">Enregistrez les annonces qui vous intéressent pour les retrouver ici.</p>
        <Link to="/explorer" className="inline-block bg-kawral-green text-white px-5 py-3 rounded-xl text-sm font-bold">Explorer les annonces</Link>
      </div>
    );
  }

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-20"><ListingGrid listings={favoriteListings} title="Mes favoris" /></div>;
};
