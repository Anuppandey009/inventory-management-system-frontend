import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import SupplierForm from './SupplierForm';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ['Owner', 'Manager'].includes(user?.role);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await API.get('/suppliers', { params });
      setSuppliers(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await API.post('/suppliers', form);
      toast.success('Supplier created');
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    setSubmitting(true);
    try {
      await API.put(`/suppliers/${editSupplier._id}`, form);
      toast.success('Supplier updated');
      setEditSupplier(null);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await API.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address', render: (row) => <span className="text-gray-500 text-xs truncate max-w-[200px] block">{row.address || '-'}</span> },
  ];

  if (canEdit) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setEditSupplier(row)} className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
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
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search suppliers..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-56 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 whitespace-nowrap">
              <Plus size={16} /> Add Supplier
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={suppliers} pagination={pagination} onPageChange={setPage} loading={loading} emptyMessage="No suppliers found" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Supplier">
        <SupplierForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>
      <Modal isOpen={!!editSupplier} onClose={() => setEditSupplier(null)} title="Edit Supplier">
        <SupplierForm supplier={editSupplier} onSubmit={handleUpdate} submitting={submitting} />
      </Modal>
    </div>
  );
}
