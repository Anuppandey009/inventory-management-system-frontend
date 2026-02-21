import { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function StockNotifications() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('stock-updated', (data) => {
      const { variantSku, type, previousStock, newStock } = data;
      const direction = newStock > previousStock ? 'increased' : 'decreased';
      toast(`Stock ${direction}: ${variantSku} (${previousStock} → ${newStock})`, {
        icon: type === 'sale' ? '📦' : type === 'purchase' ? '📥' : '🔄',
      });
    });

    return () => {
      socket.off('stock-updated');
    };
  }, [socket]);

  return null;
}
