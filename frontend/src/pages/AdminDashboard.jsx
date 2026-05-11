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

  useEffect(() => {
    fetchOrders();
  }, []);

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
      });
    } else {
      setMapCenter([adminPos.lat, adminPos.lng]);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { estado: status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id) => {
    if(!window.confirm('¿Eliminar pedido?')) return;
    try {
      await axios.delete(`${API_URL}/api/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(p => 
    (!filterDate || p.fecha === filterDate) &&
    (!filterStatus || p.estado === filterStatus)
  );

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
          <input className="date-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
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
                    <strong style={{color:'#3D2B1F'}}>{p.nombre} ({p.paquete}u)</strong><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>{p.direccion}</span><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>📞 {p.telefono}</span><br/>
                    <span style={{color:'#8B6F5A', fontSize:'11px'}}>💳 {p.pago}</span>
                    {p.comprobante && (
                      <div><a href={`${API_URL}/uploads/${p.comprobante}`} target="_blank" rel="noreferrer">Ver comprobante</a></div>
                    )}
                    <div style={{marginTop: '10px', display: 'flex', gap: '5px'}}>
                      {p.estado === 'Pendiente' && <button onClick={() => changeStatus(p.id, 'Entregado')} style={{padding:'4px', cursor:'pointer'}}>Entregado</button>}
                      {p.estado === 'Entregado' && <button onClick={() => changeStatus(p.id, 'Pendiente')} style={{padding:'4px', cursor:'pointer'}}>Pendiente</button>}
                      <button onClick={() => deleteOrder(p.id)} style={{padding:'4px', cursor:'pointer', color:'red'}}>Borrar</button>
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
                }}>
                  <div className="pedido-item-left">
                    <div className="pedido-dot" style={{background: p.estado==='Entregado' ? '#2E7D32' : '#F57F17'}}></div>
                    <div>
                      <div className="pedido-nombre">{p.nombre} ({p.paquete}u)</div>
                      <div className="pedido-dir">{p.direccion} | {p.pago}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px'}}>
                    <span className={`badge ${p.estado==='Entregado' ? 'badge-entregado' : 'badge-pendiente'}`}>{p.estado}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
