import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState({ individual: 2200, media: 3800, clasico: 5500, familiar: 8000 });
  const [archiveToast, setArchiveToast] = useState(null);
  const [progressWidth, setProgressWidth] = useState(100);
  const archiveTimerRef = useRef(null);
  const archiveProgressRef = useRef(null);

  const [stock, setStock] = useState(0);

  const fetchPrices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/prices`);
      setPrices(res.data);
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stock`);
      setStock(res.data.stock);
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const updateStockAPI = async (newValue) => {
    try {
      await axios.put(`${API_URL}/api/stock`, { value: newValue });
      setStock(newValue);
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const calcularUnidades = (paqueteData) => {
    if (!paqueteData) return 0;
    const unidadesMap = { 
      'Pack Individual': 1, 
      'Pack Media Docena': 6, 
      'Pack Clásico': 12, 
      'Pack Familiar': 24 
    };
    let totalUnidades = 0;
    const paqueteStr = Array.isArray(paqueteData) ? paqueteData.join(', ') : String(paqueteData);
    const items = paqueteStr.split(', ');
    for (const item of items) {
      const parts = item.split(' × ');
      if (parts.length === 2) {
        const qty = parseInt(parts[0], 10);
        const type = parts[1];
        totalUnidades += qty * (unidadesMap[type] || 0);
      }
    }
    return totalUnidades;
  };

  const calcularTotal = (paqueteData) => {
    if (!paqueteData) return 0;
    const preciosMap = { 
      'Pack Individual': prices.individual, 
      'Pack Media Docena': prices.media, 
      'Pack Clásico': prices.clasico, 
      'Pack Familiar': prices.familiar 
    };
    let total = 0;
    const paqueteStr = Array.isArray(paqueteData) ? paqueteData.join(', ') : String(paqueteData);
    const items = paqueteStr.split(', ');
    for (const item of items) {
      const parts = item.split(' × ');
      if (parts.length === 2) total += parseInt(parts[0], 10) * (preciosMap[parts[1]] || 0);
    }
    return total;
  };

  const fetchOrders = async () => {
    await fetchPrices();
    await fetchStock();
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      const order = orders.find(o => o.id === id);
      await axios.put(`${API_URL}/api/orders/${id}/status`, { estado: status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: status } : o));

      // Si se marca como entregado, descontar stock
      if (status === 'Entregado' && order && order.estado !== 'Entregado') {
        const unidades = calcularUnidades(order.paquete);
        updateStockAPI(Math.max(0, stock - unidades));
      }
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
      // Update local state to mark as archived
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, archivado: true } : o));
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
      // If there was a previous pending archive, commit it now
      setArchiveToast(prev => { 
        if (prev) commitArchive(prev.order); 
        return null; 
      });
    }

    // Optimistically mark as archived in local state (to hide from main view)
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, archivado: true } : o));
    
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
    setArchiveToast(prev => { 
      if (prev) {
        // Revert local state
        setOrders(cur => cur.map(o => o.id === prev.order.id ? { ...o, archivado: false } : o));
      }
      return null; 
    });
  };

  const reprogramarOrder = async (id, nuevaFecha, nuevoDesde, nuevoHasta) => {
    try {
      const updateData = {
        fecha: nuevaFecha,
        desde: nuevoDesde,
        hasta: nuevoHasta,
        estado: 'Pendiente',
        archivado: false
      };
      await axios.put(`${API_URL}/api/orders/${id}/status`, updateData);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updateData } : o));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return {
    orders, setOrders, fetchOrders,
    changeStatus, changePaymentStatus,
    deleteOrder,
    archiveOrder, undoArchive,
    reprogramarOrder,
    archiveToast, progressWidth,
    calcularTotal, calcularUnidades,
    stock, updateStockAPI,
  };
}
