import React, { useEffect, useMemo, useState } from 'react';
import '../styles/CreateContract.css';
import type { ContratoRequestDto, ContratoResponseDto, DetalleContratoDto } from '../types/contract';
import type { ClienteUnion } from '../types/client';
import type { Vehiculo } from '../types/vehicle';
import { clienteService } from '../services/clienteService';
import { vehiculoService } from '../services/vehiculoService';
import { contratoService } from '../services/contratoService';

interface CreateContractProps {
  onNavigate?: (menuId: string) => void;
  // Compat: callback legacy opcional (uso limitado)
  onCreate?: (contract: ContratoResponseDto) => void;
  contractToEdit?: ContratoResponseDto;
  clients?: ClienteUnion[];
  vehicles?: Vehiculo[];
}

type InsuranceKey = '' | 'basico' | 'completo';

const INSURANCE_LABEL: Record<InsuranceKey, string> = {
  '': 'Seleccionar seguro',
  'basico': 'Básico',
  'completo': 'Completo',
};

// Costo de seguro por día
const INSURANCE_DAILY_RATE: Record<InsuranceKey, number> = {
  '': 0,
  'basico': 15,
  'completo': 30,
};

const CreateContract: React.FC<CreateContractProps> = ({ onNavigate, onCreate, contractToEdit, clients: clientsProp = [], vehicles: vehiclesProp = [] }) => {
  const [clientId, setClientId] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyRate, setDailyRate] = useState<number | ''>(850);
  const [insurance, setInsurance] = useState<InsuranceKey>('');
  const [deposit, setDeposit] = useState<number | ''>(2000);
  const [extraDrivers, setExtraDrivers] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [clients, setClients] = useState<ClienteUnion[]>(clientsProp);
  const [vehicles, setVehicles] = useState<Vehiculo[]>(vehiclesProp);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientsProp.length === 0) {
      Promise.all([
        clienteService.findAllActivos(),
        vehiculoService.findDisponibles().catch(() => vehiculoService.listarPorEstado('DISPONIBLE')),
      ])
        .then(([cs, vs]) => { setClients(cs); setVehicles(vs); })
        .catch(() => {/* noop: UI minimal */});
    }
  }, [clientsProp.length]);

  // Parseador robusto para admitir 'YYYY-MM-DD' (input date) y 'DD/MM/YYYY'
  const parseDate = (val: string): Date | null => {
    if (!val) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [d, m, y] = val.split('/').map(Number);
      const dt = new Date(y, m - 1, d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    const dt = new Date(val);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const days = useMemo(() => {
    const s = parseDate(startDate);
    const e = parseDate(endDate);
    if (!s || !e) return 0;
    const ms = e.getTime() - s.getTime();
    if (ms <= 0) return 0;
    // Exclusivo de fecha fin (1..15 => 14)
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const numDaily = typeof dailyRate === 'number' ? dailyRate : 0;
  const insurancePerDay = INSURANCE_DAILY_RATE[insurance];

  const subtotal = days * numDaily;
  const insuranceTotal = days * insurancePerDay;
  const taxes = (subtotal + insuranceTotal) * 0.18;
  const total = subtotal + insuranceTotal + taxes;

  const displayClientName = (c: ClienteUnion) => c.tipoCliente === 'NATURAL'
    ? `${c.nombre} ${c.apellido}`
    : c.razonSocial || 'Empresa';

  const displayVehicleLabel = (v: Vehiculo) => `${v.modelo?.marca?.nombre} ${v.modelo?.nombre} (${v.placa}) - ${v.tipoVehiculo?.nombre}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validaciones básicas
      if (!clientId || !vehicleId) throw new Error('Debe seleccionar cliente y vehículo');
      if (!startDate || !endDate || days <= 0) throw new Error('Fechas inválidas');

      const detalle: DetalleContratoDto = {
        idVehiculo: vehicleId,
        precioDiario: numDaily,
      };

      const dto: ContratoRequestDto = {
        idCliente: clientId,
        fechaInicio: startDate,
        fechaFin: endDate,
        observaciones: [
          insurance ? `Seguro: ${INSURANCE_LABEL[insurance]}` : '',
          deposit !== '' ? `Depósito: S/. ${deposit}` : '',
          extraDrivers ? `Conductores: ${extraDrivers}` : '',
          specialRequests ? `Solicitudes: ${specialRequests}` : '',
        ].filter(Boolean).join(' | ') || undefined,
        detalles: [detalle],
      };

      const created: ContratoResponseDto = await contratoService.create(dto);
      // Compat opcional con callbacks legacy
      onCreate?.(created);
      onNavigate?.('contratos');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el contrato';
      alert(msg);
    }
  };

  const handleCancel = () => onNavigate?.('contratos');

  // Preseleccionar cliente y vehículo en modo edición según datos del contrato
  useEffect(() => {
    if (!contractToEdit) return;
    // Si viene un contrato a editar, cargar campos básicos si están disponibles
    setStartDate(contractToEdit?.fechaInicio || '');
    setEndDate(contractToEdit?.fechaFin || '');
    const detalle = Array.isArray(contractToEdit?.detalles) ? contractToEdit.detalles[0] : undefined;
    if (detalle) {
      setVehicleId(detalle.idVehiculo || '');
      setDailyRate(detalle.precioDiario ?? 850);
    }
    setClientId(contractToEdit?.cliente?.id || '');
  }, [contractToEdit]);

  return (
    <div className="create-contract">
      <div className="header-row">
        <button className="back-btn" onClick={() => onNavigate?.('contratos')} aria-label="Volver">
          ←
        </button>
        <div className="header-text">
          <h1 className="page-title">{contractToEdit ? 'Editar Contrato' : 'Crear Nuevo Contrato'}</h1>
          <p className="page-subtitle">{contractToEdit ? 'Actualiza la información del contrato' : 'Completa la información para crear un contrato de alquiler'}</p>
        </div>
      </div>

      <form className="content-grid" onSubmit={handleCreate}>
        <div className="left-col">
          <section className="form-section">
            <h3 className="section-title">Información del Contrato</h3>
            <div className="field-row">
              <div className="field-col">
                <label>Cliente *</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                  <option value="">Seleccionar cliente</option>
                  {(clients || []).filter(c => c.activo).map(c => (
                    <option key={c.id} value={c.id}>{displayClientName(c)}</option>
                  ))}
                </select>
              </div>
              <div className="field-col">
                <label>Vehículo *</label>
                <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                  <option value="">Seleccionar vehículo</option>
                  {(vehicles || []).filter(v => v.estado === 'DISPONIBLE').map(v => (
                    <option key={v.id} value={v.id}>{displayVehicleLabel(v)}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="section-title">Fechas del Contrato</h3>
            <div className="field-row">
              <div className="field-col">
                <label>Fecha de Inicio *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="field-col">
                <label>Fecha de Fin *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            {startDate && endDate && days === 0 && (
              <div className="help-text" style={{ color: '#b91c1c', marginTop: 6 }}>
                Revisa las fechas: deben ser válidas y la fecha de fin debe ser posterior a la de inicio.
                También puedes usar formato DD/MM/AAAA si tu navegador lo muestra así.
              </div>
            )}
          </section>

          <section className="form-section">
            <h3 className="section-title">Tarifa del Contrato</h3>
            <div className="field-row">
              <div className="field-col-full">
                <label>Monto Sin Impuestos (S/. por día) *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="850"
                  required
                />
                <div className="help-text">Este es el monto base sin impuestos que se cobrará por día de alquiler</div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="section-title">Servicios Adicionales</h3>
            <div className="field-row">
              <div className="field-col">
                <label>Seguro</label>
                <select value={insurance} onChange={(e) => setInsurance(e.target.value as InsuranceKey)}>
                  {Object.keys(INSURANCE_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {INSURANCE_LABEL[k as InsuranceKey]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-col">
                <label>Depósito (S/.)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2000"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Conductores Adicionales</label>
                <input
                  value={extraDrivers}
                  onChange={(e) => setExtraDrivers(e.target.value)}
                  placeholder="Nombres de conductores adicionales"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Solicitudes Especiales</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="GPS, silla para bebé, etc."
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="right-col">
          <div className="summary-card">
            <h3 className="summary-title">Resumen de Costos</h3>
            <div className="summary-row">
              <span>Días:</span>
              <span>{days}</span>
            </div>
            <div className="summary-row">
              <span>Tarifa diaria:</span>
              <span>S/. {numDaily.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Subtotal (sin impuestos):</span>
              <span>S/. {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Seguro:</span>
              <span>S/. {insuranceTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Impuestos (18%):</span>
              <span>S/. {taxes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>S/. {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>

            <div className="summary-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
              <button type="submit" className="btn-primary">{contractToEdit ? 'Guardar Cambios' : 'Crear Contrato'}</button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default CreateContract;
