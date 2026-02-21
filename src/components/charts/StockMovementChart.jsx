import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StockMovementChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="purchase" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Purchases" />
        <Area type="monotone" dataKey="sale" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Sales" />
        <Area type="monotone" dataKey="return" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Returns" />
        <Area type="monotone" dataKey="adjustment" stackId="4" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Adjustments" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
