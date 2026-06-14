import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminDashboard.css';
import leafletIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import leafletIcon from 'leaflet/dist/images/marker-icon.png';
import leafletShadow from 'leaflet/dist/images/marker-shadow.png';

import useOrders from '../hooks/useOrders.js';
import MapView from '../components/MapView/MapView.jsx';
import OrderTable from '../components/OrderTable/OrderTable.jsx';
import OrderModal from '../components/OrderModal/OrderModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal/DeleteConfirmModal.jsx';
import ReportsView from '../components/ReportsView/ReportsView.jsx';

import ArchivedView from '../components/ArchivedView/ArchivedView.jsx';
import StockView from '../components/StockView/StockView.jsx';
import StockAlert from '../components/StockAlert/StockAlert.jsx';
import axios from 'axios';

// Componentes extraídos
import AdminHeader from '../components/AdminHeader/AdminHeader.jsx';
import AdminTabs from '../components/AdminTabs/AdminTabs.jsx';
import RoutePlanner from '../components/RoutePlanner/RoutePlanner.jsx';
import CutoffModals from '../components/CutoffModals/CutoffModals.jsx';
import ConfigView from '../components/ConfigView/ConfigView.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: leafletIconRetina,
  iconUrl: leafletIcon,
  shadowUrl: leafletShadow,
});

export default function AdminDashboard() {
  const { 
    orders, fetchOrders, changeStatus, changePaymentStatus, deleteOrder, 
    archiveOrder, undoArchive, archiveToast, progressWidth, 
    calcularTotal, reprogramarOrder, stock, threshold, updateStockAPI, calcularUnidades 
  } = useOrders();

  const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [filterStatus, setFilterStatus] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [adminPos, setAdminPos] = useState({ lat: -34.6080, lng: -58.4620 });
  const [mapCenter, setMapCenter] = useState([-34.6080, -58.4620]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('pedidos');
  const [config, setConfig] = useState({ formularioAbierto: true, horarioCierre: '05:00' });
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [extendTime, setExtendTime] = useState('06:00');
  const [showCierreHastaModal, setShowCierreHastaModal] = useState(false);
  const [cierreHastaDate, setCierreHastaDate] = useState('');

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/config/estado`);
      setConfig(res.data);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const handleCloseNow = async () => {
    try {
      const today = new Date().toLocaleDateString('sv-SE');
      await axios.post(`${API_URL}/api/config/extender`, { cierreHasta: today });
      setShowCloseConfirm(false);
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtend = async () => {
    try {
      await axios.put(`${API_URL}/api/config/extender`, { horarioCierre: extendTime });
      setShowExtendModal(false);
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCierreHasta = async () => {
    if (!cierreHastaDate) return;
    try {
      await axios.post(`${API_URL}/api/config/extender`, { cierreHasta: cierreHastaDate });
      setShowCierreHastaModal(false);
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLevantarCierre = async () => {
    try {
      await axios.delete(`${API_URL}/api/config/extender`);
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  // Ruteo
  const [selectedForRoute, setSelectedForRoute] = useState([]);
  const [clickedLegs, setClickedLegs] = useState([]);

  const toggleOrderSelection = (id) => {
    setSelectedForRoute(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      setClickedLegs([]);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allInViewIds = filteredOrders.map(o => o.id);
    const areAllSelected = allInViewIds.every(id => selectedForRoute.includes(id));
    setSelectedForRoute(prev => {
      const next = areAllSelected ? prev.filter(id => !allInViewIds.includes(id)) : [...new Set([...prev, ...allInViewIds])];
      setClickedLegs([]);
      return next;
    });
  };

  const getOptimizedRoute = () => {
    if (selectedForRoute.length === 0) return [];
    
    const toRoute = orders.filter(o => selectedForRoute.includes(o.id));
    let currentPos = { lat: adminPos.lat, lng: adminPos.lng };
    let unvisited = [...toRoute];
    let route = [];

    while (unvisited.length > 0) {
      let closestIdx = 0;
      let minDocs = Infinity;

      unvisited.forEach((order, idx) => {
        const d = Math.sqrt(Math.pow(order.lat - currentPos.lat, 2) + Math.pow(order.lng - currentPos.lng, 2));
        if (d < minDocs) {
          minDocs = d;
          closestIdx = idx;
        }
      });

      const next = unvisited.splice(closestIdx, 1)[0];
      route.push(next);
      currentPos = { lat: next.lat, lng: next.lng };
    }
    return route;
  };

  const openRouteLeg = (legOrders) => {
    const stops = legOrders.map(o => `${o.lat},${o.lng}`).join('/');
    // El punto de partida del tramo es adminPos o el final del tramo anterior (pero para simplificar usamos adminPos o coords del 1er pedido)
    const url = `https://www.google.com/maps/dir/${adminPos.lat},${adminPos.lng}/${stops}`;
    window.open(url, '_blank');
  };

  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConfig();
    const intervalOrders = setInterval(fetchOrders, 30000);
    const intervalConfig = setInterval(fetchConfig, 60000);
    return () => {
      clearInterval(intervalOrders);
      clearInterval(intervalConfig);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const centrarEnMi = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        setAdminPos({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
      }, () => setMapCenter([adminPos.lat, adminPos.lng]), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
      setMapCenter([adminPos.lat, adminPos.lng]);
    }
  };

  const safeDate = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const str = String(fecha).split('T')[0];
    const [y, m, d] = str.split('-');
    if (!y || !m || !d) return 'Fecha no disponible';
    return `${d}/${m}/${y}`;
  };

  const renderPacks = (paquete) => {
    if (!paquete && paquete !== 0) return 'No disponible';
    if (Array.isArray(paquete)) return paquete.join(', ');
    if (typeof paquete === 'number') return `${paquete} unidades`;
    return String(paquete);
  };

  const openDeleteConfirm = (order) => {
    setOrderToDelete(order);
    setSelectedOrderId(null);
  };

  const filteredOrders = orders.filter(p => {
    if (p.archivado) return false;
    const orderDate = p.fecha ? String(p.fecha).split('T')[0] : '';
    const matchesDate = !filterDate || orderDate === filterDate;
    const matchesStatus = !filterStatus || p.estado === filterStatus;
    
    let matchesTimeRange = true;
    if (timeFrom && timeTo && p.desde) {
      const orderTime = p.desde;
      matchesTimeRange = orderTime >= timeFrom && orderTime < timeTo;
    }
    
    return matchesDate && matchesStatus && matchesTimeRange;
  }).sort((a, b) => {
    if (!a.desde || !b.desde) return 0;
    return a.desde.localeCompare(b.desde);
  });

  const filteredOrdersForMap = orders.filter(p => {
    if (p.archivado) return false;
    const orderDate = p.fecha ? String(p.fecha).split('T')[0] : '';
    return (!filterDate || orderDate === filterDate) && (!filterStatus || p.estado === filterStatus);
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'medialunas2026') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '300px' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', color: 'var(--brown)', marginBottom: '20px' }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: '10px', paddingRight: '40px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--brown)', padding: 0 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {loginError && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', textAlign: 'left' }}>Contraseña incorrecta</div>}
            <button type="submit" style={{ padding: '10px', borderRadius: '8px', background: 'var(--brown)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '15px', fontFamily: '"DM Sans", sans-serif' }}>
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'pedidos', label: '📋 Pedidos' },
    { id: 'stock', label: '📦 Stock' },
    { id: 'reportes', label: '📊 Reportes' },
    { id: 'archivados', label: '📁 Archivados' },
    { id: 'configuracion', label: '⚙️ Configuración' },
  ];

  return (
    <div className="admin-body">
      <AdminHeader config={config} />

      <AdminTabs 
        tabs={TABS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {activeTab === 'pedidos' && (
        <div className="content">
          <div className="filters">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilterDate('')}
                style={{ background: filterDate === '' ? 'var(--brown)' : '#fff', color: filterDate === '' ? '#fff' : 'inherit', border: filterDate === '' ? '1px solid var(--brown)' : '1px solid var(--border)', cursor: 'pointer', padding: '0 12px', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >Todos</button>
              <input className="date-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                style={{ borderColor: filterDate !== '' ? 'var(--brown)' : 'var(--border)' }} />
            </div>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Entregado">Entregado</option>
            </select>
            <button 
              className="mi-ubicacion-btn" 
              onClick={fetchOrders}
              style={{ background: '#fff', color: 'var(--brown)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🔄 <span className="mobile-hide">Refrescar</span>
            </button>
            <button className="mi-ubicacion-btn" onClick={centrarEnMi}>📍 Mi ubicación</button>
          </div>

          <MapView
            filteredOrders={filteredOrdersForMap}
            mapCenter={mapCenter} mapZoom={mapZoom}
            adminPos={adminPos}
            renderPacks={renderPacks} safeDate={safeDate}
            changeStatus={changeStatus} openDeleteConfirm={openDeleteConfirm}
            API_URL={API_URL}
            timeFrom={timeFrom}
            timeTo={timeTo}
          />

          <div className="leyenda">
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, marginRight: '4px' }}>Referencias:</span>
            <div className="leyenda-item"><div className="dot dot-pendiente" /> Pendiente</div>
            <div className="leyenda-item"><div className="dot dot-entregado" /> Entregado</div>
            <div className="leyenda-item"><div className="dot dot-admin" /> Mi ubicación</div>
          </div>

          <OrderTable
            filteredOrders={filteredOrders}
            setSelectedOrderId={setSelectedOrderId}
            setMapCenter={setMapCenter} setMapZoom={setMapZoom}
            renderPacks={renderPacks} safeDate={safeDate}
            selectedForRoute={selectedForRoute}
            toggleOrderSelection={toggleOrderSelection}
            toggleSelectAll={toggleSelectAll}
            timeFrom={timeFrom}
            setTimeFrom={setTimeFrom}
            timeTo={timeTo}
            setTimeTo={setTimeTo}
          />
        </div>
      )}

      {activeTab === 'pedidos' && (
        <RoutePlanner 
          selectedForRoute={selectedForRoute}
          getOptimizedRoute={getOptimizedRoute}
          openRouteLeg={openRouteLeg}
          clickedLegs={clickedLegs}
          setClickedLegs={setClickedLegs}
          setSelectedForRoute={setSelectedForRoute}
        />
      )}

      <div className="content">
        {activeTab === 'reportes' && <ReportsView orders={orders} calcularTotal={calcularTotal} />}
        {activeTab === 'stock' && (
          <StockView 
            orders={orders} 
            stock={stock} 
            updateStockAPI={updateStockAPI} 
            calcularUnidades={calcularUnidades} 
          />
        )}
        {activeTab === 'archivados' && (
          <ArchivedView 
            orders={orders} 
            deleteOrder={deleteOrder} 
            reprogramarOrder={reprogramarOrder} 
            calcularTotal={calcularTotal} 
          />
        )}
        {activeTab === 'configuracion' && (
          <ConfigView
            config={config}
            onExtendTime={fetchConfig}
            onCierreHasta={fetchConfig}
            onLevantarCierre={fetchConfig}
          />
        )}
      </div>

      <OrderModal
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        changeStatus={changeStatus}
        changePaymentStatus={changePaymentStatus}
        archiveOrder={archiveOrder}
        renderPacks={renderPacks}
        safeDate={safeDate}
        calcularTotal={calcularTotal}
      />

      <DeleteConfirmModal
        orderToDelete={orderToDelete}
        onCancel={() => { setOrderToDelete(null); setSelectedOrderId(orderToDelete.id); }}
        onConfirm={async (id) => { await deleteOrder(id); setOrderToDelete(null); setSelectedOrderId(null); }}
      />

      {archiveToast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 11000, background: '#2D2012', color: '#fff', borderRadius: '12px', padding: '0', width: 'calc(100% - 32px)', maxWidth: '420px', boxShadow: '0 6px 24px rgba(0,0,0,0.35)', overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>📦 Pedido archivado</span>
            <button onClick={undoArchive} style={{ background: '#C4922A', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.3px' }}>Deshacer</button>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '0 0 12px 12px' }}>
            <div style={{ height: '100%', width: `${progressWidth}%`, background: '#C4922A', transition: 'width 0.05s linear', borderRadius: '0 0 0 12px' }} />
          </div>
        </div>
      )}

      <StockAlert stock={stock} threshold={threshold} />
      
      <CutoffModals 
        showExtendModal={showExtendModal}
        setShowExtendModal={setShowExtendModal}
        showCloseConfirm={showCloseConfirm}
        setShowCloseConfirm={setShowCloseConfirm}
        showCierreHastaModal={showCierreHastaModal}
        setShowCierreHastaModal={setShowCierreHastaModal}
        extendTime={extendTime}
        setExtendTime={setExtendTime}
        cierreHastaDate={cierreHastaDate}
        setCierreHastaDate={setCierreHastaDate}
        handleExtend={handleExtend}
        handleCloseNow={handleCloseNow}
        handleCierreHasta={handleCierreHasta}
        cierreHasta={config.cierreHasta}
        handleLevantarCierre={handleLevantarCierre}
      />
    </div>
  );
}
