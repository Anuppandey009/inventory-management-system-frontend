import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PurchaseOrderForm from './PurchaseOrderForm';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Eye, Trash2 } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canCreate = ['Owner', 'Manager'].includes(user?.role);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/purchase-orders', { params });
      setOrders(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await API.post('/purchase-orders', form);
      toast.success('Purchase order created');
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft order?')) return;
    try {
      await API.delete(`/purchase-orders/${id}`);
      toast.success('Order deleted');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (row) => <span className="font-mono font-medium text-indigo-600">{row.orderNumber}</span>,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (row) => row.supplierId?.name || '-',
    },
    {
      key: 'items',
      label: 'Items',
      render: (row) => <span>{row.items.length} item(s)</span>,
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/purchase-orders/${row._id}`)} className="text-gray-400 hover:text-indigo-600">
            <Eye size={16} />
          </button>
          {row.status === 'Draft' && user?.role === 'Owner' && (
            <button onClick={() => handleDelete(row._id)} className="text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {canCreate && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 whitespace-nowrap">
              <Plus size={16} /> New PO
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={orders} pagination={pagination} onPageChange={setPage} loading={loading} emptyMessage="No purchase orders" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Purchase Order" size="lg">
        <PurchaseOrderForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>
    </div>
  );
}
