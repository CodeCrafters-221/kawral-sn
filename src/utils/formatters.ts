import { CategoryType, TransactionType } from '../types';
import { getCategoryLabelFromCatalog } from '../data/categoriesData';

export const formatPriceFCFA = (price: number): string => {
  if (isNaN(price)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export const getCategoryLabel = (category: CategoryType | string): string => {
  if (!category) return '';
  return getCategoryLabelFromCatalog(category);
};

export const getTransactionLabel = (type: TransactionType | 'all'): string => {
  switch (type) {
    case 'sale':
      return 'À vendre';
    case 'rent':
      return 'À louer';
    default:
      return 'Tous';
  }
};

export const formatDateFr = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};
