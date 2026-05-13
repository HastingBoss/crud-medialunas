import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function MapView({ filteredOrders, mapCenter, mapZoom, adminPos, renderPacks, safeDate, changeStatus, openDeleteConfirm, API_URL }) {
  const getIcon = (estado) => {
    const color = estado === 'Entregado' ? '#2E7D32' : '#F57F17';
    return L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8], className: '',
    });
  };

  const adminIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#1565C0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], className: '',
  });

  return (
    <div className="map-wrap">
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '380px', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[adminPos.lat, adminPos.lng]} icon={adminIcon}>
          <Popup><strong>Mi ubicación</strong></Popup>
        </Marker>
        {filteredOrders.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={getIcon(p.estado)}>
            <Popup>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: '13px', minWidth: '160px' }}>
                <strong style={{ color: '#3D2B1F' }}>{p.nombre || 'Sin nombre'} ({renderPacks(p.paquete)})</strong><br />
                <span style={{ color: '#8B6F5A', fontSize: '11px' }}>{p.direccion || 'Sin dirección'}</span><br />
                <span style={{ color: '#8B6F5A', fontSize: '11px' }}>📞 {p.telefono || 'Sin teléfono'}</span><br />
                <span style={{ color: '#8B6F5A', fontSize: '11px' }}>📅 {safeDate(p.fecha)} {p.desde && p.hasta ? `(${p.desde} a ${p.hasta})` : ''}</span><br />
                <span style={{ color: '#8B6F5A', fontSize: '11px' }}>💳 {p.pago || 'No especificado'}</span>
                {p.comprobante && (
                  <div><a href={`${API_URL}/uploads/${p.comprobante}`} target="_blank" rel="noreferrer">Ver comprobante</a></div>
                )}
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                  {p.estado === 'Pendiente' && <button onClick={() => changeStatus(p.id, 'Entregado')} style={{ padding: '4px', cursor: 'pointer' }}>Entregado</button>}
                  {p.estado === 'Entregado' && <button onClick={() => changeStatus(p.id, 'Pendiente')} style={{ padding: '4px', cursor: 'pointer' }}>Pendiente</button>}
                  <button onClick={() => openDeleteConfirm(p)} style={{ padding: '4px', cursor: 'pointer', color: '#B71C1C', background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: '4px' }}>🗑 Eliminar</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
