export const formatPrice = (value) =>
  new Intl.NumberFormat('ar-EG').format(Number(value || 0));

export const formatDate = (value) =>
  new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(value));

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
