import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Truck,
  ShoppingCart,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/inventory', icon: BarChart3, label: 'Inventory' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
];

const ownerItems = [
  { to: '/users', icon: Users, label: 'Users' },
];

export default function Sidebar({ open, onClose }) {
  const { user, tenant } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-bold text-indigo-700">InvManager</h1>
            <p className="text-xs text-gray-500 truncate">{tenant?.name}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'Owner' &&
            ownerItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
}
