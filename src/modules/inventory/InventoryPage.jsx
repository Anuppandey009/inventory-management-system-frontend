import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import Modal from '../../components/common/Modal';
import StockMovementLog from './StockMovementLog';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [products, setProducts] = useState([]);
  const [adjustForm, setAdjustForm] = useState({
    productId: '', variantId: '', type: 'adjustment', quantity: 1, reference: '', note: '',
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canAdjust = ['Owner', 'Manager'].includes(user?.role);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (typeFilter) params.type = typeFilter;
      const { data } = await API.get('/inventory/movements', { params });
      setMovements(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  const openAdjustModal = async () => {
    try {
      const { data } = await API.get('/products', { params: { limit: 100 } });
      setProducts(data.data);
      setShowAdjust(true);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProduct(product);
    setAdjustForm({ ...adjustForm, productId, variantId: '' });
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/inventory/adjust', adjustForm);
      toast.success('Stock adjusted');
      setShowAdjust(false);
      setAdjustForm({ productId: '', variantId: '', type: 'adjustment', quantity: 1, reference: '', note: '' });
      setSelectedProduct(null);
      fetchMovements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="return">Return</option>
            <option value="adjustment">Adjustment</option>
          </select>
          {canAdjust && (
            <button onClick={openAdjustModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <ArrowUpDown size={16} /> Adjust Stock
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <StockMovementLog movements={movements} loading={loading} />
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title="Stock Adjustment" size="md">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            <select value={adjustForm.productId} onChange={(e) => handleProductSelect(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variant *</label>
              <select value={adjustForm.variantId} onChange={(e) => setAdjustForm({ ...adjustForm, variantId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select a variant</option>
                {selectedProduct.variants.map((v) => (
                  <option key={v._id} value={v._id}>{v.sku} (Stock: {v.stock})</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="adjustment">Adjustment</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="return">Return</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" min="1" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 1 })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input value={adjustForm.reference} onChange={(e) => setAdjustForm({ ...adjustForm, reference: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Manual count correction" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea value={adjustForm.note} onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? 'Adjusting...' : 'Submit Adjustment'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
