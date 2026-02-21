import { useState, useEffect } from 'react';
import VariantManager from './VariantManager';

const defaultForm = {
  name: '',
  description: '',
  category: '',
  variants: [{ sku: '', attributes: {}, price: '', costPrice: '', stock: 0, lowStockThreshold: 10 }],
};

export default function ProductForm({ product, onSubmit, submitting }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        variants: product.variants.map((v) => ({
          ...v,
          attributes: v.attributes instanceof Map
            ? Object.fromEntries(v.attributes)
            : v.attributes || {},
        })),
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Wireless Mouse"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Electronics"
        />
      </div>
      <VariantManager variants={form.variants} onChange={(variants) => setForm({ ...form, variants })} />
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}
