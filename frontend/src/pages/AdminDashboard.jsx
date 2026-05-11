import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fix para íconos de leaflet por defecto
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [adminPos, setAdminPos] = useState({ lat: -34.6080, lng: -58.4620 });
  const [mapCenter, setMapCenter] = useState([-34.6080, -58.4620]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const centrarEnMi = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        setAdminPos({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
      }, () => {
        setMapCenter([adminPos.lat, adminPos.lng]);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      setMapCenter([adminPos.lat, adminPos.lng]);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { estado: status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: status } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, estado: status }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changePaymentStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { estadoPago: status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, estadoPago: status } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, estadoPago: status }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calcularTotal = (paqueteData) => {
    if (!paqueteData) return 0;
    const preciosMap = { 'Pack Individual': 2200, 'Pack Media Docena': 3800, 'Pack Clásico': 5500, 'Pack Familiar': 8000 };
    let total = 0;
    const paqueteStr = Array.isArray(paqueteData) ? paqueteData.join(', ') : String(paqueteData);
    const items = paqueteStr.split(', ');
    for (const item of items) {
      const parts = item.split(' × ');
      if (parts.length === 2) {
        total += parseInt(parts[0], 10) * (preciosMap[parts[1]] || 0);
      }
    }
    return total;
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

  const deleteOrder = async (id) => {
    if(!window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`${API_URL}/api/orders/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(p => {
    const orderDate = p.fecha ? String(p.fecha).split('T')[0] : '';
    return (!filterDate || orderDate === filterDate) &&
           (!filterStatus || p.estado === filterStatus);
  });

  const getIcon = (estado) => {
    const color = estado === 'Entregado' ? '#2E7D32' : '#F57F17';
    return L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8], className: ''
    });
  };

  const adminIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#1565C0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], className: ''
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
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none' }}
            />
            {loginError && <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', textAlign: 'left' }}>Contraseña incorrecta</div>}
            <button 
              type="submit" 
              style={{ padding: '10px', borderRadius: '8px', background: 'var(--brown)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '15px', fontFamily: '"DM Sans", sans-serif' }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <div className="header">
        <div className="header-title">🥐 <span>Admin</span> Medialunas</div>
      </div>
      <div className="tabs">
        <div className="tab active">Mapa y Pedidos</div>
      </div>

      <div className="content">
        <div className="filters">
          <div style={{display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => setFilterDate('')}
              style={{
                background: filterDate === '' ? 'var(--brown)' : '#fff',
                color: filterDate === '' ? '#fff' : 'inherit',
                border: filterDate === '' ? '1px solid var(--brown)' : '1px solid var(--border)',
                cursor: 'pointer',
                padding: '0 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Todos
            </button>
            <input 
              className="date-input" 
              type="date" 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
              style={{
                borderColor: filterDate !== '' ? 'var(--brown)' : 'var(--border)'
              }}
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Entregado">Entregado</option>
          </select>
          <button className="mi-ubicacion-btn" onClick={centrarEnMi}>📍 Mi ubicación</button>
        </div>

        <div className="map-wrap">
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '380px', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[adminPos.lat, adminPos.lng]} icon={adminIcon}>
              <Popup><strong>Mi ubicación</strong></Popup>
            </Marker>
            {filteredOrders.map(p => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={getIcon(p.estado)}>
                <Popup>
                  <div style={{fontFamily:'"DM Sans",sans-serif', fontSize:'13px', minWidth:'160px'}}>
                    <strong style={{color:'#3D2B1F'}}>{p.nombre || 'Sin nombre'} ({renderPacks(p.paquete)})</strong><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>{p.direccion || 'Sin dirección'}</span><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>📞 {p.telefono || 'Sin teléfono'}</span><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>📅 {safeDate(p.fecha)} {p.desde && p.hasta ? `(${p.desde} a ${p.hasta})` : ''}</span><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>💳 {p.pago || 'No especificado'}</span>
                    {p.comprobante && (
                      <div><a href={`${API_URL}/uploads/${p.comprobante}`} target="_blank" rel="noreferrer">Ver comprobante</a></div>
                    )}
                    <div style={{marginTop: '10px', display: 'flex', gap: '5px'}}>
                      {p.estado === 'Pendiente' && <button onClick={() => changeStatus(p.id, 'Entregado')} style={{padding:'4px', cursor:'pointer'}}>Entregado</button>}
                      {p.estado === 'Entregado' && <button onClick={() => changeStatus(p.id, 'Pendiente')} style={{padding:'4px', cursor:'pointer'}}>Pendiente</button>}
                      <button onClick={() => deleteOrder(p.id)} style={{padding:'4px', cursor:'pointer', color:'#B71C1C', background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: '4px'}}>🗑 Eliminar</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="leyenda">
          <span style={{fontSize:'12px', color:'var(--muted)', fontWeight:500, marginRight:'4px'}}>Referencias:</span>
          <div className="leyenda-item"><div className="dot dot-pendiente"></div> Pendiente</div>
          <div className="leyenda-item"><div className="dot dot-entregado"></div> Entregado</div>
          <div className="leyenda-item"><div className="dot dot-admin"></div> Mi ubicación</div>
        </div>

        <div className="pedidos-cercanos">
          <div className="pedidos-cercanos-header">{filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} en el mapa</div>
          <div>
            {!filteredOrders.length ? (
              <div style={{padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:'13px'}}>No hay pedidos para mostrar</div>
            ) : (
              filteredOrders.map(p => (
                <div key={p.id} className="pedido-item" onClick={() => {
                  setMapCenter([p.lat, p.lng]);
                  setMapZoom(16);
                  setSelectedOrder(p);
                }}>
                  <div className="pedido-item-left">
                    <div className="pedido-dot" style={{background: p.estado==='Entregado' ? '#2E7D32' : '#F57F17'}}></div>
                    <div>
                      <div className="pedido-nombre">{p.nombre || 'Sin nombre'} ({renderPacks(p.paquete)})</div>
                      <div className="pedido-dir">{p.direccion || 'Sin dirección'} | {p.pago || 'No especificado'}</div>
                      <div className="pedido-dir" style={{marginTop:'2px', fontWeight: 500}}>📅 {safeDate(p.fecha)} {p.desde && p.hasta ? `(${p.desde} a ${p.hasta})` : ''}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px'}}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="badge" style={{ background: p.estadoPago === 'Pagado' ? '#e8f5e9' : '#fff3e0', color: p.estadoPago === 'Pagado' ? '#2E7D32' : '#F57F17' }}>
                        💲 {p.estadoPago === 'Pagado' ? 'Pagado' : 'Pendiente'}
                      </span>
                      <span className={`badge ${p.estado==='Entregado' ? 'badge-entregado' : 'badge-pendiente'}`}>{p.estado}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = (p.lat != null && p.lng != null) 
                          ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.direccion)}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      style={{
                        background: '#f9f9f9',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      📍 Navegar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--brown)' }}>✕</button>
            <h2 style={{ color: 'var(--brown)', marginTop: 0, marginBottom: '15px', fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Detalle del Pedido</h2>
            
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Cliente:</strong> {selectedOrder.nombre || 'No disponible'}</p>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Teléfono:</strong> {selectedOrder.telefono || 'No disponible'}</p>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Dirección:</strong> {selectedOrder.direccion || 'No disponible'}</p>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Fecha y hora:</strong> {safeDate(selectedOrder.fecha)} ({selectedOrder.desde || '--'} a {selectedOrder.hasta || '--'})</p>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Packs:</strong> {renderPacks(selectedOrder.paquete)}</p>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Total:</strong> ${(selectedOrder.total || calcularTotal(selectedOrder.paquete)).toLocaleString('es-AR')}</p>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
              <strong style={{ color: 'var(--brown)' }}>Método de pago:</strong> {selectedOrder.pago || 'No disponible'} 
              {selectedOrder.comprobante && <a href={`${API_URL}/uploads/${selectedOrder.comprobante}`} target="_blank" rel="noreferrer" style={{color: 'var(--gold)', marginLeft: '5px', textDecoration: 'underline'}}>Ver comprobante</a>}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${selectedOrder.estadoPago === 'Pagado' ? '#2E7D32' : '#F57F17'}`, background: selectedOrder.estadoPago === 'Pagado' ? '#e8f5e9' : '#fff3e0', textAlign: 'center', fontSize: '14px' }}>
                <strong style={{ color: selectedOrder.estadoPago === 'Pagado' ? '#2E7D32' : '#F57F17' }}>Pago: {selectedOrder.estadoPago || 'Pendiente'}</strong>
              </div>
              <div style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${selectedOrder.estado === 'Entregado' ? '#2E7D32' : '#F57F17'}`, background: selectedOrder.estado === 'Entregado' ? '#e8f5e9' : '#fff3e0', textAlign: 'center', fontSize: '14px' }}>
                <strong style={{ color: selectedOrder.estado === 'Entregado' ? '#2E7D32' : '#F57F17' }}>Entrega: {selectedOrder.estado}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  const phoneDigits = String(selectedOrder.telefono || '').replace(/\D/g, '');
                  const phoneStr = phoneDigits.startsWith('54') ? phoneDigits.slice(2) : phoneDigits;
                  const packsStr = renderPacks(selectedOrder.paquete);
                  const fechaStr = safeDate(selectedOrder.fecha);
                  const msg = `Hola ${selectedOrder.nombre || ''}, tu pedido de ${packsStr} está confirmado para el ${fechaStr} entre ${selectedOrder.desde || '--'} y ${selectedOrder.hasta || '--'}. 🥐`;
                  window.open(`https://wa.me/54${phoneStr}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                style={{ background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: '"DM Sans", sans-serif' }}
              >Confirmar por WhatsApp</button>
              
              <button 
                onClick={() => {
                  const url = (selectedOrder.lat != null && selectedOrder.lng != null) 
                    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.lat},${selectedOrder.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.direccion)}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                style={{ background: '#1976D2', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: '"DM Sans", sans-serif' }}
              >📍 Navegar</button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => changePaymentStatus(selectedOrder.id, selectedOrder.estadoPago === 'Pagado' ? 'Pendiente' : 'Pagado')}
                  style={{ flex: 1, background: '#fff', color: '#333', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}
                >Marcar como {selectedOrder.estadoPago === 'Pagado' ? 'Pendiente de pago' : 'Pagado'}</button>
                <button 
                  onClick={() => changeStatus(selectedOrder.id, selectedOrder.estado === 'Entregado' ? 'Pendiente' : 'Entregado')}
                  style={{ flex: 1, background: '#fff', color: '#333', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}
                >Marcar como {selectedOrder.estado === 'Entregado' ? 'Pendiente' : 'Entregado'}</button>
              </div>

              <button 
                onClick={() => deleteOrder(selectedOrder.id)}
                style={{ 
                  marginTop: '10px',
                  width: '100%', 
                  background: '#FFF0F0', 
                  color: '#B71C1C', 
                  border: '1px solid #FFCDD2', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  fontFamily: '"DM Sans", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >🗑 Eliminar pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
