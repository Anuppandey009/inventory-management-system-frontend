import { Plus, Trash2 } from 'lucide-react';

const emptyVariant = { sku: '', attributes: {}, price: '', costPrice: '', stock: 0, lowStockThreshold: 10 };

export default function VariantManager({ variants, onChange }) {
  const addVariant = () => onChange([...variants, { ...emptyVariant }]);

  const removeVariant = (idx) => {
    if (variants.length <= 1) return;
    onChange(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx, field, value) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const updateAttribute = (idx, key, value) => {
    const updated = [...variants];
    updated[idx] = {
      ...updated[idx],
      attributes: { ...updated[idx].attributes, [key]: value },
    };
    onChange(updated);
  };

  const addAttribute = (idx) => {
    const key = prompt('Attribute name (e.g., size, color):');
    if (!key) return;
    updateAttribute(idx, key, '');
  };

  const removeAttribute = (idx, key) => {
    const updated = [...variants];
    const attrs = { ...updated[idx].attributes };
    delete attrs[key];
    updated[idx] = { ...updated[idx], attributes: attrs };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Variants ({variants.length})</h3>
        <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          <Plus size={14} /> Add Variant
        </button>
      </div>
      {variants.map((v, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Variant {idx + 1}</span>
            {variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">SKU *</label>
              <input value={v.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} required className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Price *</label>
              <input type="number" step="0.01" min="0" value={v.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} required className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cost Price *</label>
              <input type="number" step="0.01" min="0" value={v.costPrice} onChange={(e) => updateVariant(idx, 'costPrice', e.target.value)} required className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stock</label>
              <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Low Stock Threshold</label>
            <input type="number" min="0" value={v.lowStockThreshold} onChange={(e) => updateVariant(idx, 'lowStockThreshold', parseInt(e.target.value) || 0)} className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Attributes</label>
              <button type="button" onClick={() => addAttribute(idx)} className="text-xs text-indigo-600 hover:text-indigo-700">+ Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(v.attributes || {}).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1">
                  <span className="text-xs text-gray-500">{key}:</span>
                  <input value={val} onChange={(e) => updateAttribute(idx, key, e.target.value)} className="w-16 text-xs border-none outline-none" />
                  <button type="button" onClick={() => removeAttribute(idx, key)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
