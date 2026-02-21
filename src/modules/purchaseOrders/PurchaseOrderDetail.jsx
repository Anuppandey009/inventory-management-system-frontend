import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { ArrowLeft, PackageCheck } from 'lucide-react';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceive, setShowReceive] = useState(false);
  const [receiveItems, setReceiveItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const canManage = ['Owner', 'Manager'].includes(user?.role);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await API.get(`/purchase-orders/${id}`);
      setOrder(data.data.order);
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleStatusChange = async (status) => {
    try {
      await API.patch(`/purchase-orders/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openReceiveModal = () => {
    if (!order) return;
    setReceiveItems(
      order.items
        .filter((i) => i.receivedQuantity < i.quantity)
        .map((i) => ({ itemId: i._id, sku: i.variantSku, max: i.quantity - i.receivedQuantity, quantity: 0 }))
    );
    setShowReceive(true);
  };

  const handleReceive = async () => {
    const toReceive = receiveItems.filter((i) => i.quantity > 0);
    if (toReceive.length === 0) {
      toast.error('Enter at least one quantity to receive');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`/purchase-orders/${id}/receive`, {
        receivedItems: toReceive.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      });
      toast.success('Delivery received');
      setShowReceive(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to receive');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-500 py-12">Order not found</p>;
  }

  const statusActions = {
    Draft: [{ label: 'Send to Supplier', status: 'Sent', color: 'bg-blue-600 hover:bg-blue-700' }],
    Sent: [{ label: 'Mark Confirmed', status: 'Confirmed', color: 'bg-indigo-600 hover:bg-indigo-700' }],
    Confirmed: [],
    'Partially Received': [],
  };

  const canReceive = ['Confirmed', 'Partially Received'].includes(order.status);

  return (
    <div>
      <button onClick={() => navigate('/purchase-orders')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Purchase Orders
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm">Supplier: {order.supplierId?.name || '-'}</p>
            {order.expectedDelivery && (
              <p className="text-gray-500 text-sm">Expected: {formatDate(order.expectedDelivery)}</p>
            )}
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(statusActions[order.status] || []).map((action) => (
              <button key={action.status} onClick={() => handleStatusChange(action.status)} className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${action.color}`}>
                {action.label}
              </button>
            ))}
            {canReceive && (
              <button onClick={openReceiveModal} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <PackageCheck size={16} /> Receive Delivery
              </button>
            )}
            {order.status !== 'Received' && order.status !== 'Cancelled' && (
              <button onClick={() => handleStatusChange('Cancelled')} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                Cancel Order
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">SKU</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Qty</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Received</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Unit Price</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 text-gray-900">{item.productId?.name || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{item.variantSku}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={item.receivedQuantity >= item.quantity ? 'text-green-600 font-medium' : 'text-amber-600'}>
                      {item.receivedQuantity}
                    </span>
                    /{item.quantity}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}
      </div>

      <Modal isOpen={showReceive} onClose={() => setShowReceive(false)} title="Receive Delivery" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter the quantity received for each item.</p>
          {receiveItems.map((item, idx) => (
            <div key={item.itemId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium font-mono text-indigo-600">{item.sku}</p>
                <p className="text-xs text-gray-500">Remaining: {item.max}</p>
              </div>
              <input
                type="number"
                min="0"
                max={item.max}
                value={item.quantity}
                onChange={(e) => {
                  const updated = [...receiveItems];
                  updated[idx].quantity = Math.min(parseInt(e.target.value) || 0, item.max);
                  setReceiveItems(updated);
                }}
                className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          ))}
          <button onClick={handleReceive} disabled={submitting} className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {submitting ? 'Processing...' : 'Confirm Receipt'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
