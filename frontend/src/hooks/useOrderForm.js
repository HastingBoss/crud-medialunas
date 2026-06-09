import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const nombres = { individual: 'Pack Individual', media: 'Pack Media Docena', clasico: 'Pack Clásico', familiar: 'Pack Familiar' };

export default function useOrderForm() {
  const [precios, setPrecios] = useState({ individual: 2200, media: 3800, clasico: 6800, familiar: 12500 });
  const [formData, setFormData] = useState({ nombre: '', telefono: '', direccion: '', fecha: '', desde: '', hasta: '', pago: '' });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/prices`);
        setPrecios(res.data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      }
    };
    fetchPrices();
  }, []);
  const [qtys, setQtys] = useState({ individual: 0, media: 0, clasico: 0, familiar: 0 });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [submitted, setSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comprobanteEnviado, setComprobanteEnviado] = useState(false);
  const [anticipationError, setAnticipationError] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [outsideRadius, setOutsideRadius] = useState(false);

  const ORIGEN = { lat: -34.7785456, lng: -58.3868270 };
  const RADIO_KM = 1;

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const checkRadius = (lat, lng) => {
    if (!lat || !lng) return;
    const dist = haversineKm(ORIGEN.lat, ORIGEN.lng, parseFloat(lat), parseFloat(lng));
    setOutsideRadius(dist > RADIO_KM);
  };

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [showCalendar]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheelNative = (e) => {
      if (e.deltaY !== 0) {
        const isScrollingRight = e.deltaY > 0 && Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth;
        const isScrollingLeft = e.deltaY < 0 && el.scrollLeft > 0;
        if (isScrollingRight || isScrollingLeft) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY, behavior: 'auto' });
        }
      }
    };
    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, [showCalendar]);

  const scrollByAmount = (amount) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const today = new Date();
  const formatDateISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayISO = formatDateISO(today);
  const tomorrowObj = new Date(today);
  tomorrowObj.setDate(today.getDate() + 1);
  const next7Days = [];
  let dIterator = new Date(today);
  while (next7Days.length < 7) {
    if (dIterator.getDay() !== 0 && dIterator.getDay() !== 6) {
      next7Days.push(new Date(dIterator));
    }
    dIterator.setDate(dIterator.getDate() + 1);
  }
  const daysStr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 30);

  const parseLocalDate = (isoStr) => {
    if (!isoStr) return null;
    const [y, m, d] = isoStr.split('-');
    return new Date(y, m - 1, d);
  };

  const getSelectedDateText = () => {
    if (!formData.fecha) return null;
    const [y, m, d] = formData.fecha.split('-');
    const dateObj = new Date(y, m - 1, d);
    return `✓ Entrega el ${daysStr[dateObj.getDay()]} ${d}/${m}/${y}`;
  };

  const formatAddress = (addr) => {
    const { road, house_number, suburb, city, town, village, county } = addr;
    const street = road || '';
    const num = house_number ? ` ${house_number}` : '';
    const local = suburb || city || town || village || '';
    const mun = county ? `, ${county.replace('Partido de ', '').replace('Departamento de ', '')}` : '';
    return `${street}${num}${local ? `, ${local}` : ''}${mun}`;
  };

  const handleInputChange = (field, value) => {
    if (field === 'pago' && value !== formData.pago) setComprobanteEnviado(false);
    
    if (field === 'fecha') {
      if (value === todayISO) {
        setFormData(prev => ({ ...prev, fecha: '' }));
        setAnticipationError(true);
        return;
      } else {
        setAnticipationError(false);
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'direccion') {
      setOutsideRadius(false);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (value.length < 4) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&countrycodes=ar&format=json&limit=5&addressdetails=1`);
          // Formatear cada sugerencia
          const formatted = res.data.map(s => ({
            ...s,
            cleanName: formatAddress(s.address)
          }));
          setAddressSuggestions(formatted);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingAddress(false);
        }
      }, 800);
    }
  };

  const selectSuggestion = (s) => {
    setFormData(prev => ({ ...prev, direccion: s.cleanName }));
    setCoords({ lat: s.lat, lng: s.lon });
    setAddressSuggestions([]);
    checkRadius(s.lat, s.lon);
  };

  const cambiarQty = (pack, delta) => {
    setQtys(prev => ({ ...prev, [pack]: Math.max(0, prev[pack] + delta) }));
  };

  const handleAddressBlur = async () => {
    if (!formData.direccion) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.direccion)}&countrycodes=ar&format=json&limit=1`);
      if (res.data && res.data.length > 0) {
        setCoords({ lat: res.data[0].lat, lng: res.data[0].lon });
        checkRadius(res.data[0].lat, res.data[0].lon);
      } else {
        setCoords({ lat: null, lng: null });
      }
    } catch (err) {
      console.error(err);
      setCoords({ lat: null, lng: null });
    }
  };

  const resumenLineas = [];
  let total = 0;
  for (const k in qtys) {
    if (qtys[k] > 0) {
      const sub = qtys[k] * precios[k];
      total += sub;
      resumenLineas.push(`${qtys[k]} × ${nombres[k]}`);
    }
  }

  const nombreValido = formData.nombre.trim().length >= 3;
  const telefonoValido = formData.telefono.replace(/\D/g, '').length >= 10;
  const direccionValida = formData.direccion.trim().length >= 5;
  const totalPacks = Object.values(qtys).reduce((a, b) => a + b, 0);
  const packsCompletos = totalPacks > 0;
  const fechaCompleta = !!formData.fecha;
  const horarioCompleto = formData.desde && formData.hasta && formData.desde < formData.hasta;
  const pagoSeleccionado = !!formData.pago;
  const pagoCompleto = pagoSeleccionado && (formData.pago !== 'transferencia' || comprobanteEnviado);
  const formValido = nombreValido && telefonoValido && direccionValida && !outsideRadius && packsCompletos && fechaCompleta && horarioCompleto && pagoCompleto;
  const datosCompletos = formData.nombre && formData.telefono && formData.direccion;

  const handleSubmit = async () => {
    if (!datosCompletos) { alert('Completá tus datos personales.'); return; }
    if (!packsCompletos) { alert('Seleccioná al menos un pack.'); return; }
    if (!formData.fecha) { setDateError(true); return; }
    if (!formData.desde || !formData.hasta) { alert('Indicá el horario de entrega.'); return; }
    if (formData.desde >= formData.hasta) { alert('El horario "hasta" debe ser posterior al "desde".'); return; }
    if (!formData.pago) { alert('Elegí un método de pago.'); return; }

    const payload = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      direccion: formData.direccion,
      fecha: formData.fecha,
      desde: formData.desde,
      hasta: formData.hasta,
      pago: formData.pago,
      paquete: resumenLineas.join(', '),
      lat: coords.lat || null,
      lng: coords.lng || null,
    };

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/orders`, payload);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, handleInputChange,
    qtys, cambiarQty,
    submitted,
    showCalendar, setShowCalendar,
    dateError, setDateError,
    isSubmitting,
    comprobanteEnviado, setComprobanteEnviado,
    anticipationError, setAnticipationError,
    scrollRef, canScrollLeft, canScrollRight, handleScroll, scrollByAmount,
    today, todayISO, tomorrowObj, next7Days, daysStr, formatDateISO, parseLocalDate, maxDateObj, getSelectedDateText,
    resumenLineas, total,
    packsCompletos, fechaCompleta, horarioCompleto, pagoCompleto, formValido, datosCompletos,
    handleSubmit, handleAddressBlur, selectSuggestion,
    precios, nombres, addressSuggestions, isSearchingAddress, setAddressSuggestions,
    outsideRadius,
  };
}
