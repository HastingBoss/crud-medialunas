import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

export default function MapView({ filteredOrders, mapCenter, mapZoom, adminPos, renderPacks, safeDate, changeStatus, openDeleteConfirm, API_URL, timeFrom, timeTo }) {
  const getIcon = (estado, isDimmed) => {
    const color = estado === 'Entregado' ? '#2E7D32' : '#F57F17';
    const opacity = isDimmed ? 0.3 : 1;
    return L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3);opacity:${opacity}"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8], className: '',
    });
  };

  const matchesTimeFilter = (order) => {
    if (!timeFrom || !timeTo || !order.desde) return true;
    return order.desde >= timeFrom && order.desde <= timeTo;
  };

  const adminIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#1565C0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], className: '',
  });

  return (
    <div className="map-wrap">
      <MapContainer center={mapCenter} zoom={mapZoom} className="map-view-container">
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[adminPos.lat, adminPos.lng]} icon={adminIcon}>
          <Popup><strong>Mi ubicación</strong></Popup>
        </Marker>
        {filteredOrders.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={getIcon(p.estado, !matchesTimeFilter(p))}>
            <Popup>
              <div className="map-popup-content">
                <strong className="map-popup-title">{p.nombre || 'Sin nombre'} ({renderPacks(p.paquete)})</strong><br />
                <span className="map-popup-info">{p.direccion || 'Sin dirección'}</span>
                <span className="map-popup-info">📞 {p.telefono || 'Sin teléfono'}</span>
                <span className="map-popup-info">📅 {safeDate(p.fecha)} {p.desde && p.hasta ? `(${p.desde} a ${p.hasta})` : ''}</span>
                <span className="map-popup-info">💳 {p.pago || 'No especificado'}</span>
                {p.comprobante && (
                  <div><a href={`${API_URL}/uploads/${p.comprobante}`} target="_blank" rel="noreferrer">Ver comprobante</a></div>
                )}
                <div className="map-popup-actions">
                  {p.estado === 'Pendiente' && <button className="btn-popup-status" onClick={() => changeStatus(p.id, 'Entregado')}>Entregado</button>}
                  {p.estado === 'Entregado' && <button className="btn-popup-status" onClick={() => changeStatus(p.id, 'Pendiente')}>Pendiente</button>}
                  <button className="btn-popup-delete" onClick={() => openDeleteConfirm(p)}>🗑 Eliminar</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
