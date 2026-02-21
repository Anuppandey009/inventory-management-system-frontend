export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    Draft: 'bg-gray-100 text-gray-800',
    Sent: 'bg-blue-100 text-blue-800',
    Confirmed: 'bg-indigo-100 text-indigo-800',
    'Partially Received': 'bg-yellow-100 text-yellow-800',
    Received: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const variantAttributesToString = (attributes) => {
  if (!attributes) return '';
  if (attributes instanceof Map) {
    return Array.from(attributes.entries()).map(([k, v]) => `${k}: ${v}`).join(', ');
  }
  if (typeof attributes === 'object') {
    return Object.entries(attributes).map(([k, v]) => `${k}: ${v}`).join(', ');
  }
  return String(attributes);
};
