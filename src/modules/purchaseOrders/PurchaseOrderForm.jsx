import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyItem = { productId: '', variantId: '', variantSku: '', quantity: 1, unitPrice: 0 };

export default function PurchaseOrderForm({ order, onSubmit, submitting }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplierId: '',
    items: [{ ...emptyItem }],
    notes: '',
    expectedDelivery: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          API.get('/suppliers', { params: { limit: 100 } }),
          API.get('/products', { params: { limit: 100 } }),
        ]);
        setSuppliers(sRes.data.data);
        setProducts(pRes.data.data);
      } catch {
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (order) {
      setForm({
        supplierId: order.supplierId?._id || order.supplierId || '',
        items: order.items.map((i) => ({
          productId: i.productId?._id || i.productId,
          variantId: i.variantId,
          variantSku: i.variantSku,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        notes: order.notes || '',
        expectedDelivery: order.expectedDelivery ? order.expectedDelivery.slice(0, 10) : '',
      });
    }
  }, [order]);

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });

  const removeItem = (idx) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };

    if (field === 'productId') {
      items[idx].variantId = '';
      items[idx].variantSku = '';
    }
    if (field === 'variantId') {
      const product = products.find((p) => p._id === items[idx].productId);
      const variant = product?.variants.find((v) => v._id === value);
      if (variant) items[idx].variantSku = variant.sku;
    }

    setForm({ ...form, items });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
        <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select supplier</option>
          {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Items *</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, idx) => {
            const selectedProduct = products.find((p) => p._id === item.productId);
            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Item {idx + 1}</span>
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} required className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Product</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  <select value={item.variantId} onChange={(e) => updateItem(idx, 'variantId', e.target.value)} required className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Variant</option>
                    {selectedProduct?.variants.map((v) => <option key={v._id} value={v._id}>{v.sku}</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} placeholder="Qty" required className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="Unit Price" required className="px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
        <input type="date" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <button type="submit" disabled={submitting} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
        {submitting ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
      </button>
    </form>
  );
}
