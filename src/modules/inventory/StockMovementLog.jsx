import { formatDateTime } from '../../utils/helpers';

const typeColors = {
  purchase: 'bg-green-100 text-green-800',
  sale: 'bg-blue-100 text-blue-800',
  return: 'bg-yellow-100 text-yellow-800',
  adjustment: 'bg-purple-100 text-purple-800',
};

export default function StockMovementLog({ movements, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (movements.length === 0) {
    return <p className="text-gray-500 text-center py-12 text-sm">No stock movements yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">SKU</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Qty</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Stock Change</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {movements.map((m) => (
            <tr key={m._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDateTime(m.createdAt)}</td>
              <td className="px-4 py-2 text-gray-900">{m.productId?.name || '-'}</td>
              <td className="px-4 py-2 font-mono text-indigo-600 text-xs">{m.variantSku}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[m.type]}`}>
                  {m.type}
                </span>
              </td>
              <td className="px-4 py-2 font-medium">{m.quantity}</td>
              <td className="px-4 py-2 text-gray-600">{m.previousStock} → {m.newStock}</td>
              <td className="px-4 py-2 text-gray-500">{m.performedBy?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
