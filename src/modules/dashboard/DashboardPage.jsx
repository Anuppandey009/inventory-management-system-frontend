import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StockMovementChart from '../../components/charts/StockMovementChart';
import { formatCurrency } from '../../utils/helpers';
import { Package, DollarSign, Truck, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, lowStockRes, topRes, graphRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/dashboard/low-stock'),
          API.get('/dashboard/top-sellers'),
          API.get('/dashboard/stock-graph'),
        ]);
        setStats(statsRes.data.data);
        setLowStock(lowStockRes.data.data.lowStockItems);
        setTopSellers(topRes.data.data.topSellers);
        setGraphData(graphRes.data.data.graph);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Inventory Value" value={formatCurrency(stats?.inventoryValue)} color="bg-indigo-500" />
        <StatCard icon={Package} label="Total Products" value={stats?.productCount || 0} color="bg-blue-500" />
        <StatCard icon={Truck} label="Suppliers" value={stats?.supplierCount || 0} color="bg-emerald-500" />
        <StatCard icon={ShoppingCart} label="Pending POs" value={stats?.pendingPOCount || 0} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Movements (7 Days)</h2>
          {graphData.length > 0 ? (
            <StockMovementChart data={graphData} />
          ) : (
            <p className="text-gray-500 text-sm py-12 text-center">No movement data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Sellers (30 Days)</h2>
          </div>
          {topSellers.length > 0 ? (
            <div className="space-y-3">
              {topSellers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">SKU: {item.variantSku}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{item.totalSold} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-12 text-center">No sales data yet</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
        </div>
        {lowStock.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">SKU</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Threshold</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Pending PO</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStock.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2 text-gray-600">{item.sku}</td>
                    <td className="px-4 py-2 font-medium text-red-600">{item.stock}</td>
                    <td className="px-4 py-2 text-gray-600">{item.lowStockThreshold}</td>
                    <td className="px-4 py-2 text-indigo-600">{item.pendingFromPO > 0 ? `+${item.pendingFromPO}` : '-'}</td>
                    <td className="px-4 py-2">
                      {item.needsAlert ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Needs Restock</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">PO Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">All items are well-stocked</p>
        )}
      </div>
    </div>
  );
}
