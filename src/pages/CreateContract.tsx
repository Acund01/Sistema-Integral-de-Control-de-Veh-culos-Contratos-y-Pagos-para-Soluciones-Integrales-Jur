import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
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



type InsuranceKey = '' | 'basico' | 'completo' | 'ninguno';

const INSURANCE_LABEL: Record<InsuranceKey, string> = {
  '': 'Seleccionar seguro',
  'basico': 'Básico',
  'completo': 'Completo',
  'ninguno': 'Sin seguro',
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
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
    if (ms < 0) return 0;
    // Inclusivo: ambas fechas cuentan (21/11 al 30/11 = 10 días)
    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === vehicleId), [vehicles, vehicleId]);

  const numDaily = typeof dailyRate === 'number' ? dailyRate : 0;
  const depositAmount = typeof deposit === 'number' ? deposit : 0;

  const subtotal = days * numDaily;
  const baseForTax = subtotal + depositAmount; // subtotal + depósito
  const taxes = baseForTax * 0.18; // IGV sobre (subtotal + depósito)
  const total = baseForTax + taxes; // total = subtotal + depósito + IGV

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

      let result: ContratoResponseDto;
      if (contractToEdit) {
        result = await contratoService.update(contractToEdit.id, dto);
        setConfirmDialog({
          isOpen: true,
          title: 'Éxito',
          message: 'Contrato actualizado',
          type: 'success',
          onConfirm: () => {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            onCreate?.(result);
            onNavigate?.('contratos');
          },
        });
      } else {
        result = await contratoService.create(dto);
        setConfirmDialog({
          isOpen: true,
          title: 'Éxito',
          message: 'Contrato creado',
          type: 'success',
          onConfirm: () => {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            onCreate?.(result);
            onNavigate?.('contratos');
          },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el contrato';
      setConfirmDialog({
        isOpen: true,
        title: 'Error',
        message: msg,
        type: 'danger',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleCancel = () => onNavigate?.('contratos');

  // Preseleccionar cliente y vehículo en modo edición según datos del contrato
  useEffect(() => {
    if (!contractToEdit) return;
    setStartDate(contractToEdit.fechaInicio || '');
    setEndDate(contractToEdit.fechaFin || '');
    const detalle = contractToEdit.detalles?.[0];
    if (detalle) {
      setVehicleId(detalle.idVehiculo || '');
      setDailyRate(detalle.precioDiario ?? 850);
    }
    setClientId(contractToEdit.cliente?.id || '');
    // Parse observaciones en edición
    const obs = (contractToEdit.observaciones || '').split('|').map(o => o.trim()).filter(Boolean);
    obs.forEach(o => {
      if (/^Seguro:\s*/i.test(o)) {
        const val = o.replace(/^Seguro:\s*/i, '').toLowerCase();
        if (val.includes('básico') || val.includes('basico')) setInsurance('basico');
        else if (val.includes('completo')) setInsurance('completo');
        else if (val.includes('sin seguro') || val.includes('ninguno')) setInsurance('ninguno');
      } else if (/^Depósito:\s*S\/.?/i.test(o)) {
        const num = o.replace(/^Depósito:\s*S\/.?\s*/i, '').replace(/[,]/g,'');
        const parsed = Number(num);
        if (!isNaN(parsed)) setDeposit(parsed);
      } else if (/^Conductores:/i.test(o)) {
        setExtraDrivers(o.replace(/^Conductores:\s*/i,'').trim());
      } else if (/^Solicitudes:/i.test(o)) {
        setSpecialRequests(o.replace(/^Solicitudes:\s*/i,'').trim());
      }
    });
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
                {selectedVehicle && selectedVehicle.imagenUrl && (
                  <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <img 
                      src={selectedVehicle.imagenUrl} 
                      alt={`${selectedVehicle.marca} ${selectedVehicle.modelo}`} 
                      style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
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
              <span>Depósito:</span>
              <span>S/. {depositAmount.toLocaleString()}</span>
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
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CreateContract;
