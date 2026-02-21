import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ProductForm from './ProductForm';
import { formatCurrency, variantAttributesToString } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ['Owner', 'Manager'].includes(user?.role);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await API.get('/products', { params });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await API.post('/products', form);
      toast.success('Product created');
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    setSubmitting(true);
    try {
      await API.put(`/products/${editProduct._id}`, form);
      toast.success('Product updated');
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const columns = [
    { key: 'name', label: 'Product', render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.name}</p>
        <p className="text-xs text-gray-500">{row.category}</p>
      </div>
    )},
    { key: 'variants', label: 'Variants', render: (row) => (
      <div className="space-y-1">
        {row.variants.slice(0, 3).map((v) => (
          <div key={v._id} className="text-xs">
            <span className="font-mono text-indigo-600">{v.sku}</span>
            {' - '}
            <span className="text-gray-500">{variantAttributesToString(v.attributes)}</span>
          </div>
        ))}
        {row.variants.length > 3 && <span className="text-xs text-gray-400">+{row.variants.length - 3} more</span>}
      </div>
    )},
    { key: 'stock', label: 'Total Stock', render: (row) => (
      <span className="font-medium">{row.variants.reduce((s, v) => s + v.stock, 0)}</span>
    )},
    { key: 'value', label: 'Value', render: (row) => (
      formatCurrency(row.variants.reduce((s, v) => s + v.stock * v.price, 0))
    )},
  ];

  if (canEdit) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setEditProduct(row)} className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
          {user?.role === 'Owner' && (
            <button onClick={() => handleDelete(row._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
          )}
        </div>
      ),
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products or SKU..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 whitespace-nowrap">
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={products} pagination={pagination} onPageChange={setPage} loading={loading} emptyMessage="No products found" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Product" size="lg">
        <ProductForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>

      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        <ProductForm product={editProduct} onSubmit={handleUpdate} submitting={submitting} />
      </Modal>
    </div>
  );
}
