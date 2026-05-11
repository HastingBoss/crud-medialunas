import React, { useState } from 'react';
import axios from 'axios';
import './UserForm.css';

export default function UserForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    paquete: '',
    pago: ''
  });
  const [comprobante, setComprobante] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePackageSelect = (pkg) => setFormData({ ...formData, paquete: pkg });
  const handlePaymentSelect = (pay) => setFormData({ ...formData, pago: pay });
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.telefono || !formData.paquete || !formData.pago) {
      alert('Por favor completá todos los campos antes de enviar.');
      return;
    }

    if (formData.pago === 'transferencia' && !comprobante) {
      alert('Por favor adjuntá el comprobante de transferencia.');
      return;
    }

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('telefono', formData.telefono);
    data.append('paquete', formData.paquete);
    data.append('pago', formData.pago);
    if (comprobante) data.append('comprobante', comprobante);
    
    // Asignar una geolocalización o que el backend la asigne
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        data.append('lat', pos.coords.latitude);
        data.append('lng', pos.coords.longitude);
        await sendData(data);
      }, async () => {
        await sendData(data);
      });
    } else {
      await sendData(data);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const sendData = async (data) => {
    try {
      await axios.post(`${API_URL}/api/orders`, data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar el pedido');
    }
  };

  if (submitted) {
    return (
      <div className="success-screen visible">
        <div className="success-icon">✓</div>
        <h2>¡Pedido recibido!</h2>
        <p>Gracias, <span style={{fontWeight:500,color:'var(--brown)'}}>{formData.nombre}</span>.<br/>Te vamos a escribir por WhatsApp para confirmar tu pedido.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <div className="hero-label">Pedidos online</div>
        <h1>Medialunas<br/><em>artesanales</em></h1>
        <p className="hero-desc">Elaboradas con manteca de primera calidad. Pedí tu paquete y las recibís en el día.</p>
        <div className="divider"><span>🥐</span></div>
      </div>

      <div className="form-container">
        <p className="section-title">Tus datos</p>

        <div className="field">
          <label>Nombre completo</label>
          <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: María García" />
        </div>

        <div className="field">
          <label>Teléfono / WhatsApp</label>
          <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="Ej: 11 1234-5678" />
        </div>

        <p className="section-title" style={{marginTop:'24px'}}>Elegí tu paquete</p>

        <div className="packages-grid">
          {[
            { value: '12', price: '$2.500' },
            { value: '24', price: '$4.800' },
            { value: '36', price: '$6.900' },
            { value: '48', price: '$8.800' }
          ].map(pkg => (
            <label key={pkg.value} className={`package-card ${formData.paquete === pkg.value ? 'selected' : ''}`} onClick={() => handlePackageSelect(pkg.value)}>
              <div className="check-icon"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <div className="package-qty">{pkg.value}</div>
              <div className="package-unit">unidades</div>
              <div className="package-price">{pkg.price}</div>
            </label>
          ))}
        </div>

        <p className="section-title" style={{marginTop:'24px'}}>Método de pago</p>

        <div className="payment-options">
          <label className={`pay-option ${formData.pago === 'transferencia' ? 'selected' : ''}`} onClick={() => handlePaymentSelect('transferencia')}>
            <div className="pay-icon">🏦</div>
            <div className="pay-label">Transferencia</div>
            <div className="pay-sub">Adjuntá tu comprobante</div>
          </label>
          <label className={`pay-option ${formData.pago === 'efectivo' ? 'selected' : ''}`} onClick={() => handlePaymentSelect('efectivo')}>
            <div className="pay-icon">💵</div>
            <div className="pay-label">Efectivo</div>
            <div className="pay-sub">Al momento de la entrega</div>
          </label>
        </div>

        {formData.pago === 'transferencia' && (
          <div className="comprobante-field visible">
            <label>Comprobante de transferencia</label>
            <div className={`upload-area ${comprobante ? 'has-file' : ''}`}>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
              <div className="upload-icon">📎</div>
              <div className="upload-text">
                <strong>Tocá para adjuntar</strong><br/>
                JPG, PNG o PDF
              </div>
              {comprobante && <div className="file-name" style={{display:'block'}}>✓ {comprobante.name}</div>}
            </div>
          </div>
        )}

        <button className="submit-btn" onClick={handleSubmit}>
          Enviar pedido <span className="btn-gold">→</span>
        </button>

        <p className="note">Te contactaremos por WhatsApp para confirmar tu pedido 🥐</p>
      </div>
    </>
  );
}
