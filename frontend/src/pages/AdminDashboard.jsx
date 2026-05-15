import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminDashboard.css';
import leafletIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import leafletIcon from 'leaflet/dist/images/marker-icon.png';
import leafletShadow from 'leaflet/dist/images/marker-shadow.png';

import useOrders from '../hooks/useOrders.js';
import MapView from '../components/MapView.jsx';
import OrderTable from '../components/OrderTable.jsx';
import OrderModal from '../components/OrderModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import ReportsView from '../components/ReportsView.jsx';
import PricesView from '../components/PricesView.jsx';
import ArchivedView from '../components/ArchivedView.jsx';
import StockView from '../components/StockView.jsx';
import StockAlert from '../components/StockAlert.jsx';
import axios from 'axios';

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

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [adminPos, setAdminPos] = useState({ lat: -34.6080, lng: -58.4620 });
  const [mapCenter, setMapCenter] = useState([-34.6080, -58.4620]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('pedidos');
  const [config, setConfig] = useState({ formularioAbierto: true, horarioCierre: '05:00' });
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendTime, setExtendTime] = useState('06:00');

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/config/estado`);
      setConfig(res.data);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const handleCloseNow = async () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    try {
      await axios.put(`${API_URL}/api/config/extender`, { horaExtencion: currentTime });
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtend = async () => {
    try {
      await axios.put(`${API_URL}/api/config/extender`, { horaExtencion: extendTime });
      setShowExtendModal(false);
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  // Ruteo
  const [selectedForRoute, setSelectedForRoute] = useState([]);
  const [clickedLegs, setClickedLegs] = useState([]);

  const toggleOrderSelection = (id) => {
    setSelectedForRoute(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allInViewIds = filteredOrders.map(o => o.id);
    const areAllSelected = allInViewIds.every(id => selectedForRoute.includes(id));
    if (areAllSelected) {
      setSelectedForRoute(prev => prev.filter(id => !allInViewIds.includes(id)));
    } else {
      setSelectedForRoute(prev => [...new Set([...prev, ...allInViewIds])]);
    }
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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
    fetchConfig();
    const intervalOrders = setInterval(fetchOrders, 30000);
    const intervalConfig = setInterval(fetchConfig, 60000);
    return () => {
      clearInterval(intervalOrders);
      clearInterval(intervalConfig);
    };
  }, [isAuthenticated]);

  // Sync selectedOrder state when changeStatus/changePaymentStatus mutate orders
  useEffect(() => {
    if (!selectedOrder) return;
    const updated = orders.find(o => o.id === selectedOrder.id);
    if (updated && (updated.estado !== selectedOrder.estado || updated.estadoPago !== selectedOrder.estadoPago)) {
      setSelectedOrder(updated);
    }
  }, [orders]);

  // Reset clicked legs when selection changes
  useEffect(() => {
    setClickedLegs([]);
  }, [selectedForRoute]);

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
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return 'Fecha no disponible';
    return d.toLocaleDateString('es-AR');
  };

  const renderPacks = (paquete) => {
    if (!paquete && paquete !== 0) return 'No disponible';
    if (Array.isArray(paquete)) return paquete.join(', ');
    if (typeof paquete === 'number') return `${paquete} unidades`;
    return String(paquete);
  };

  const openDeleteConfirm = (order) => {
    setOrderToDelete(order);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(p => {
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
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none' }} />
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
    { id: 'pedidos', label: 'Mapa y Pedidos' },
    { id: 'reportes', label: '📊 Reportes' },
    { id: 'precios', label: '💰 Precios' },
    { id: 'stock', label: '📦 Stock' },
    { id: 'archivados', label: '📦 Archivados' },
  ];

  return (
    <div className="admin-body">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-title">🥐 <span>Admin</span> Medialunas</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: '20px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: config.formularioAbierto ? '#4CAF50' : '#F44336', boxShadow: `0 0 8px ${config.formularioAbierto ? '#4CAF50' : '#F44336'}` }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown)', whiteSpace: 'nowrap' }}>
              {config.formularioAbierto ? 'Pedidos abiertos' : 'Pedidos cerrados'}
            </span>
          </div>

          {config.formularioAbierto ? (
            <button 
              onClick={handleCloseNow}
              style={{ background: 'var(--brown)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Cerrar ahora
            </button>
          ) : (
            <button 
              onClick={() => setShowExtendModal(true)}
              style={{ background: 'var(--gold)', color: 'var(--brown)', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Extender horario
            </button>
          )}
        </div>
      </div>

      <div className="tabs" style={{ 
        overflowX: 'auto', 
        display: 'flex', 
        whiteSpace: 'nowrap', 
        paddingBottom: '2px',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}>
        {TABS.map(t => (
          <div key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)} style={{ cursor: 'pointer', flexShrink: 0 }}>
            {t.label}
          </div>
        ))}
      </div>

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
            filteredOrders={filteredOrders}
            mapCenter={mapCenter} mapZoom={mapZoom}
            adminPos={adminPos}
            renderPacks={renderPacks} safeDate={safeDate}
            changeStatus={changeStatus} openDeleteConfirm={openDeleteConfirm}
            API_URL={API_URL}
          />

          <div className="leyenda">
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, marginRight: '4px' }}>Referencias:</span>
            <div className="leyenda-item"><div className="dot dot-pendiente" /> Pendiente</div>
            <div className="leyenda-item"><div className="dot dot-entregado" /> Entregado</div>
            <div className="leyenda-item"><div className="dot dot-admin" /> Mi ubicación</div>
          </div>

          <OrderTable
            filteredOrders={filteredOrders}
            setSelectedOrder={setSelectedOrder}
            setMapCenter={setMapCenter} setMapZoom={setMapZoom}
            renderPacks={renderPacks} safeDate={safeDate}
            selectedForRoute={selectedForRoute}
            toggleOrderSelection={toggleOrderSelection}
            toggleSelectAll={toggleSelectAll}
          />
        </div>
      )}

      {selectedForRoute.length > 0 && activeTab === 'pedidos' && (() => {
        const fullRoute = getOptimizedRoute();
        const legs = [];
        for (let i = 0; i < fullRoute.length; i += 9) {
          legs.push(fullRoute.slice(i, i + 9));
        }

        return (
          <div style={{ 
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
            background: 'var(--brown)', color: '#fff', padding: '12px 20px', borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
            zIndex: 1000, animation: 'slideUp 0.3s ease-out', width: 'max-content', maxWidth: '90vw'
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
              }
            `}</style>
            <div style={{ fontSize: '13px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '12px' }}>
              {selectedForRoute.length} seleccionado{selectedForRoute.length !== 1 ? 's' : ''}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {legs.length === 1 ? (
                <button 
                  onClick={() => openRouteLeg(legs[0])}
                  style={{ background: 'var(--gold)', color: 'var(--brown)', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  🚀 Armar Ruta
                </button>
              ) : (
                legs.map((leg, idx) => {
                  const isDisabled = idx > 0 && !clickedLegs.includes(idx - 1);
                  return (
                    <button 
                      key={idx}
                      disabled={isDisabled}
                      onClick={() => {
                        openRouteLeg(leg);
                        setClickedLegs(prev => [...new Set([...prev, idx])]);
                      }}
                      style={{ 
                        background: isDisabled ? 'rgba(255,255,255,0.2)' : 'var(--gold)', 
                        color: isDisabled ? 'rgba(255,255,255,0.4)' : 'var(--brown)', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontWeight: 700, 
                        cursor: isDisabled ? 'not-allowed' : 'pointer', 
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        filter: isDisabled ? 'grayscale(1)' : 'none',
                        opacity: isDisabled ? 0.7 : 1
                      }}
                    >
                      Tramo {idx + 1} ({leg.length})
                    </button>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => setSelectedForRoute([])}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
        );
      })()}

      <div className="content">
        {activeTab === 'reportes' && <ReportsView orders={orders} calcularTotal={calcularTotal} />}
        {activeTab === 'precios' && <PricesView />}
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
      </div>

      <OrderModal
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        changeStatus={changeStatus}
        changePaymentStatus={changePaymentStatus}
        archiveOrder={archiveOrder}
        renderPacks={renderPacks}
        safeDate={safeDate}
        calcularTotal={calcularTotal}
      />

      <DeleteConfirmModal
        orderToDelete={orderToDelete}
        onCancel={() => { setOrderToDelete(null); setSelectedOrder(orderToDelete); }}
        onConfirm={async (id) => { await deleteOrder(id); setOrderToDelete(null); setSelectedOrder(null); }}
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
      
      {showExtendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', color: 'var(--brown)', marginTop: 0 }}>Extender horario</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>Elegí la nueva hora de cierre automático para hoy.</p>
            
            <select 
              value={extendTime} 
              onChange={e => setExtendTime(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', marginBottom: '20px', outline: 'none', fontSize: '16px', fontFamily: 'inherit' }}
            >
              <option value="06:00">06:00 hs</option>
              <option value="07:00">07:00 hs</option>
              <option value="08:00">08:00 hs</option>
              <option value="09:00">09:00 hs</option>
              <option value="10:00">10:00 hs</option>
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowExtendModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >Cancelar</button>
              <button 
                onClick={handleExtend}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--brown)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
