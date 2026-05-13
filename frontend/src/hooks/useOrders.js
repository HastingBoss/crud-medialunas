import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const calcularTotal = (paqueteData) => {
  if (!paqueteData) return 0;
  const preciosMap = { 'Pack Individual': 2200, 'Pack Media Docena': 3800, 'Pack Clásico': 5500, 'Pack Familiar': 8000 };
  let total = 0;
  const paqueteStr = Array.isArray(paqueteData) ? paqueteData.join(', ') : String(paqueteData);
  const items = paqueteStr.split(', ');
  for (const item of items) {
    const parts = item.split(' × ');
    if (parts.length === 2) total += parseInt(parts[0], 10) * (preciosMap[parts[1]] || 0);
  }
  return total;
};

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [archiveToast, setArchiveToast] = useState(null);
  const [progressWidth, setProgressWidth] = useState(100);
  const archiveTimerRef = useRef(null);
  const archiveProgressRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { estado: status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const changePaymentStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { estadoPago: status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, estadoPago: status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/orders/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const commitArchive = async (order) => {
    try {
      await axios.put(`${API_URL}/api/orders/${order.id}/status`, { archivado: true });
    } catch (err) {
      console.error(err);
    }
  };

  const archiveOrder = (order, onClose) => {
    if (archiveTimerRef.current) {
      clearTimeout(archiveTimerRef.current);
      clearInterval(archiveProgressRef.current);
      archiveTimerRef.current = null;
      archiveProgressRef.current = null;
      setArchiveToast(prev => { if (prev) commitArchive(prev.order); return null; });
    }

    setOrders(prev => prev.filter(o => o.id !== order.id));
    if (onClose) onClose();
    setProgressWidth(100);
    setArchiveToast({ order });

    const DURATION = 5000;
    const INTERVAL = 50;
    let elapsed = 0;
    archiveProgressRef.current = setInterval(() => {
      elapsed += INTERVAL;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgressWidth(pct);
      if (elapsed >= DURATION) {
        clearInterval(archiveProgressRef.current);
        archiveProgressRef.current = null;
      }
    }, INTERVAL);

    archiveTimerRef.current = setTimeout(() => {
      archiveTimerRef.current = null;
      clearInterval(archiveProgressRef.current);
      archiveProgressRef.current = null;
      commitArchive(order);
      setArchiveToast(null);
    }, DURATION);
  };

  const undoArchive = () => {
    if (archiveTimerRef.current) { clearTimeout(archiveTimerRef.current); archiveTimerRef.current = null; }
    if (archiveProgressRef.current) { clearInterval(archiveProgressRef.current); archiveProgressRef.current = null; }
    setArchiveToast(prev => { if (prev) setOrders(cur => [prev.order, ...cur]); return null; });
  };

  return {
    orders, setOrders, fetchOrders,
    changeStatus, changePaymentStatus,
    deleteOrder,
    archiveOrder, undoArchive,
    archiveToast, progressWidth,
    calcularTotal,
  };
}
