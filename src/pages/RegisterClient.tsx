import React, { useEffect, useState, useCallback } from 'react';
import '../styles/RegisterClient.css';
import type { ClienteNaturalDto, ClienteEmpresaDto } from '../types/client';
import { clienteService } from '../services/clienteService';
import { activityService } from '../services/activityService';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Tipo local de compatibilidad con componentes padres (si lo usan)
type LegacyClientPayload = {
  nombres?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
};

interface RegisterClientProps {
  onNavigate?: (menuId: string) => void;
  onAddClient?: (
    client: LegacyClientPayload
  ) => void;
  // Soporte de edición
  clientId?: string; // si viene, estamos editando
  initialData?: Partial<{
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    correo: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    contactoEmergenciaNombre: string;
    contactoEmergenciaTelefono: string;
    notas: string;
    razonSocial: string;
    ruc: string;
    giroComercial: string;
    direccionFiscal: string;
    representanteNombres: string;
    representanteApellidos: string;
    representanteTipoDocumento: string;
    representanteNumeroDocumento: string;
    representanteCargo: string;
    representanteCorreo: string;
    representanteTelefono: string;
  }>;
  onUpdateClient?: (
    id: string,
    client: LegacyClientPayload
  ) => void;
}

const RegisterClient: React.FC<RegisterClientProps> = ({ onNavigate, onAddClient, clientId, initialData, onUpdateClient }) => {
  const [clientType, setClientType] = useState<'natural' | 'company'>(initialData?.razonSocial ? 'company' : 'natural');

  // Datos del formulario
  interface FormData {
    nombres?: string;
    apellidos?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    correo?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    // notas eliminadas
    razonSocial?: string;
    ruc?: string;
    giroComercial?: string;
    direccionFiscal?: string;
    representanteNombres?: string;
    representanteApellidos?: string;
    representanteTipoDocumento?: string;
    representanteNumeroDocumento?: string;
    representanteCargo?: string;
    representanteCorreo?: string;
    representanteTelefono?: string;
  }

  const [form, setForm] = useState<FormData>({
    // Persona natural
    nombres: initialData?.nombres ?? '',
    apellidos: initialData?.apellidos ?? '',
    tipoDocumento: initialData?.tipoDocumento ?? '',
    numeroDocumento: initialData?.numeroDocumento ?? '',
    correo: initialData?.correo ?? '',
    telefono: initialData?.telefono ?? '',
    direccion: initialData?.direccion ?? '',
    ciudad: initialData?.ciudad ?? '',
    // notas fuera
    // Persona jurídica
    razonSocial: initialData?.razonSocial ?? '',
    ruc: initialData?.ruc ?? '',
    giroComercial: initialData?.giroComercial ?? '',
    direccionFiscal: initialData?.direccionFiscal ?? '',
    representanteNombres: initialData?.representanteNombres ?? '',
    representanteApellidos: initialData?.representanteApellidos ?? '',
    representanteTipoDocumento: initialData?.representanteTipoDocumento ?? '',
    representanteNumeroDocumento: initialData?.representanteNumeroDocumento ?? '',
    representanteCargo: initialData?.representanteCargo ?? '',
    representanteCorreo: initialData?.representanteCorreo ?? '',
    representanteTelefono: initialData?.representanteTelefono ?? '',
  });

  type Errors = Partial<Record<keyof FormData | 'clientType', string>>;
  const [errors, setErrors] = useState<Errors>({});
  const [autoValidate, setAutoValidate] = useState<boolean>(false);
  const [, setTouched] = useState<Record<string, boolean>>({});
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

  const validate = useCallback((data: FormData, type: 'natural' | 'company'): Errors => {
    const err: Errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^[0-9+\-()\s]{6,}$/;

    if (type === 'natural') {
      if (!data.nombres?.trim()) err.nombres = 'Nombres es obligatorio';
      if (!data.apellidos?.trim()) err.apellidos = 'Apellidos es obligatorio';
      if (!data.tipoDocumento) err.tipoDocumento = 'Seleccione un tipo de documento';
      if (!data.numeroDocumento?.trim()) err.numeroDocumento = 'Número de documento es obligatorio';
      if (data.tipoDocumento === 'dni' && data.numeroDocumento && !/^\d{8}$/.test(data.numeroDocumento)) {
        err.numeroDocumento = 'DNI debe tener 8 dígitos';
      }
      if (!data.correo?.trim()) err.correo = 'Correo es obligatorio';
      else if (!emailRegex.test(data.correo)) err.correo = 'Correo no es válido';
      if (data.telefono && !phoneRegex.test(data.telefono)) err.telefono = 'Teléfono no válido';
    } else {
      if (!data.razonSocial?.trim()) err.razonSocial = 'Razón Social es obligatorio';
      if (!data.ruc?.trim()) err.ruc = 'RUC es obligatorio';
      else if (!/^\d{11}$/.test(data.ruc)) err.ruc = 'RUC debe tener 11 dígitos';
      
      // Validación de contacto de empresa
      if (!data.correo?.trim()) err.correo = 'Correo de la empresa es obligatorio';
      else if (!emailRegex.test(data.correo)) err.correo = 'Correo no es válido';

      if (!data.telefono?.trim()) {
        err.telefono = 'Teléfono de la empresa es obligatorio';
      } else if (data.telefono.length < 9) {
        err.telefono = 'Teléfono debe tener al menos 9 caracteres';
      } else if (!phoneRegex.test(data.telefono)) {
        err.telefono = 'Teléfono no válido';
      }

      if (!data.representanteNombres?.trim()) err.representanteNombres = 'Nombres del representante es obligatorio';
      if (!data.representanteApellidos?.trim()) err.representanteApellidos = 'Apellidos del representante es obligatorio';
      if (!data.representanteTipoDocumento) err.representanteTipoDocumento = 'Seleccione tipo de documento';
      if (!data.representanteNumeroDocumento?.trim()) err.representanteNumeroDocumento = 'Número de documento es obligatorio';
      if (!data.representanteCorreo?.trim()) err.representanteCorreo = 'Correo del representante es obligatorio';
      else if (!emailRegex.test(data.representanteCorreo)) err.representanteCorreo = 'Correo no es válido';
      if (data.representanteTelefono && !phoneRegex.test(data.representanteTelefono)) err.representanteTelefono = 'Teléfono no válido';
    }

    return err;
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (autoValidate) {
      setErrors(validate({ ...form, [name]: value }, clientType));
    }
  };

  useEffect(() => {
    if (autoValidate) {
      setErrors(validate(form, clientType));
    }
  }, [form, clientType, autoValidate, validate]);

  const handleCancel = () => {
    onNavigate?.('dashboard');
  };

  const handleValidatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors = validate(form, clientType);
    setErrors(currentErrors);
    setAutoValidate(true);
    const touchedAll: Record<string, boolean> = {};
    Object.keys(currentErrors).forEach((k) => (touchedAll[k] = true));
    setTouched((prev) => ({ ...prev, ...touchedAll }));
    if (Object.keys(currentErrors).length > 0) return;

    try {
      if (clientType === 'natural') {
        const dto: ClienteNaturalDto = {
          nombre: form.nombres ?? '',
          apellido: form.apellidos ?? '',
          tipoDocumento: (form.tipoDocumento || '').toUpperCase(),
          numeroDocumento: form.numeroDocumento ?? '',
          correo: form.correo ?? '',
          telefono: form.telefono ?? '',
          direccion: form.direccion ?? '',
          // notas removidas
        };
        if (clientId) {
          await clienteService.updateNatural(clientId, dto);
        } else {
          await clienteService.createNatural(dto);
        }
      } else {
        const dto: ClienteEmpresaDto = {
          razonSocial: form.razonSocial ?? '',
          ruc: form.ruc ?? '',
          giroComercial: form.giroComercial ?? '',
          direccionFiscal: form.direccionFiscal ?? '',
          correo: form.correo ?? '',
          telefono: form.telefono ?? '',
          direccion: form.direccion ?? '',
          representante: {
            nombre: form.representanteNombres ?? '',
            apellido: form.representanteApellidos ?? '',
            tipoDocumento: (form.representanteTipoDocumento || '').toUpperCase(),
            numeroDocumento: form.representanteNumeroDocumento ?? '',
            cargo: form.representanteCargo ?? '',
            correo: form.representanteCorreo ?? '',
            telefono: form.representanteTelefono ?? '',
          },
          // notas removidas
        };
        if (clientId) {
          await clienteService.updateEmpresa(clientId, dto);
        } else {
          await clienteService.createEmpresa(dto);
        }
      }

      // Compatibilidad opcional con padres
      const payload: LegacyClientPayload = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        telefono: form.telefono,
        ciudad: form.ciudad,
      };
      if (clientId && onUpdateClient) onUpdateClient(clientId, payload);
      if (!clientId && onAddClient) onAddClient(payload);

      // Registrar actividad
      if (clientType === 'natural') {
        activityService.log(clientId ? `Actualizaste cliente: ${form.nombres} ${form.apellidos}` : `Registraste cliente: ${form.nombres} ${form.apellidos}`);
      } else {
        activityService.log(clientId ? `Actualizaste empresa: ${form.razonSocial}` : `Registraste empresa: ${form.razonSocial}`);
      }

      setConfirmDialog({
        isOpen: true,
        title: clientId ? 'Cliente actualizado' : 'Cliente registrado',
        message: clientId ? 'Los datos del cliente se han actualizado correctamente' : 'El cliente se ha registrado exitosamente en el sistema',
        type: 'success',
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onNavigate?.('clientes');
        },
      });
    } catch (err) {
      console.error(err);
      setConfirmDialog({
        isOpen: true,
        title: 'Error',
        message: `Error al ${clientId ? 'actualizar' : 'registrar'} cliente: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        type: 'danger',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      });
    }
  };

  // Ajustar tipo si cambia initialData por edición tardía
  useEffect(() => {
    if (clientId) {
      setClientType(initialData?.razonSocial ? 'company' : 'natural');
    }
  }, [clientId, initialData]);

  return (
    <div className="register-client page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">{clientId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h1>
          <p className="page-subtitle">{clientId ? 'Actualiza la información y guarda los cambios' : 'Completa la información del cliente para agregarlo al sistema'}</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleValidatedSubmit}>
        {Object.keys(errors).length > 0 && (
          <div className="form-errors" role="alert">
            <strong>Por favor corrige los siguientes campos:</strong>
            <ul>
              {Object.entries(errors).map(([key, msg]) => (msg ? <li key={key}>{msg}</li> : null))}
            </ul>
          </div>
        )}
        <section className="form-section">
          <h3 className="section-title">👤 Tipo de Cliente</h3>
          <div className="field-row">
            <label>Tipo de Cliente *</label>
            <select
              name="clientType"
              value={clientType}
              onChange={(e) => setClientType(e.target.value as 'natural' | 'company')}
              disabled={!!clientId} // no permitir cambiar tipo en edición
            >
              <option value="natural">Persona Natural</option>
              <option value="company">Persona Jurídica (Empresa)</option>
            </select>
          </div>
        </section>

        {clientType === 'natural' ? (
          <>
            <section className="form-section">
              <h3 className="section-title">👤 Información Personal</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Nombres *</label>
                  <input name="nombres" value={form.nombres} onChange={handleChange} placeholder="Juan Carlos" required />
                </div>
                <div className="field-col">
                  <label>Apellidos *</label>
                  <input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Pérez García" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Tipo de Documento *</label>
                  <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} required>
                    <option value="">Seleccionar tipo</option>
                    <option value="dni">DNI</option>
                    <option value="ce">Carné de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="field-col">
                  <label>Número de Documento *</label>
                  <input
                    name="numeroDocumento"
                    value={form.numeroDocumento}
                    onChange={handleChange}
                    placeholder="12345678"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">📬 Información de Contacto</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Correo Electrónico *</label>
                  <input
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="juan.perez@email.com"
                    type="email"
                    required
                  />
                </div>
                <div className="field-col">
                  <label>Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="+51 1 234-5678" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Jr. Los Olivos 123" />
                </div>
                <div className="field-col">
                  <label>Ciudad</label>
                  <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
                </div>
              </div>
            </section>

            {/* Sección de notas eliminada */}
          </>
        ) : (
          <>
            <section className="form-section">
              <h3 className="section-title">🏢 Información de la Empresa</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Razón Social *</label>
                  <input
                    name="razonSocial"
                    value={form.razonSocial}
                    onChange={handleChange}
                    placeholder="Empresa Transportes SAC"
                    required
                  />
                </div>
                <div className="field-col">
                  <label>RUC *</label>
                  <input
                    name="ruc"
                    value={form.ruc}
                    onChange={handleChange}
                    placeholder="20123456789"
                    inputMode="numeric"
                    pattern="\d{11}"
                    required
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Giro Comercial</label>
                  <select name="giroComercial" value={form.giroComercial} onChange={handleChange}>
                    <option value="">Seleccionar sector</option>
                    <option value="transporte">Transporte</option>
                    <option value="turismo">Turismo</option>
                    <option value="logistica">Logística</option>
                  </select>
                </div>
                <div className="field-col">
                  <label>Dirección Fiscal</label>
                  <input name="direccionFiscal" value={form.direccionFiscal} onChange={handleChange} placeholder="Av. Javier Prado Este 123" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">👔 Datos del Representante</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Nombres del Representante *</label>
                  <input
                    name="representanteNombres"
                    value={form.representanteNombres}
                    onChange={handleChange}
                    placeholder="Carlos Antonio"
                    required
                  />
                </div>
                <div className="field-col">
                  <label>Apellidos del Representante *</label>
                  <input
                    name="representanteApellidos"
                    value={form.representanteApellidos}
                    onChange={handleChange}
                    placeholder="López Silva"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Tipo de Documento *</label>
                  <select
                    name="representanteTipoDocumento"
                    value={form.representanteTipoDocumento}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="dni">DNI</option>
                    <option value="ce">Carné de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="field-col">
                  <label>Número de Documento *</label>
                  <input
                    name="representanteNumeroDocumento"
                    value={form.representanteNumeroDocumento}
                    onChange={handleChange}
                    placeholder="87654321"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                  />
                </div>
                <div className="field-col">
                  <label>Cargo</label>
                  <input name="representanteCargo" value={form.representanteCargo} onChange={handleChange} placeholder="Gerente General" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Correo del Representante *</label>
                  <input
                    name="representanteCorreo"
                    value={form.representanteCorreo}
                    onChange={handleChange}
                    placeholder="carlos.lopez@empresa.com"
                    type="email"
                    required
                  />
                </div>
                <div className="field-col">
                  <label>Teléfono del Representante</label>
                  <input
                    name="representanteTelefono"
                    value={form.representanteTelefono}
                    onChange={handleChange}
                    placeholder="+51 1 234-5678"
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">📬 Información de Contacto Adicional</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Correo de la Empresa *</label>
                  <input
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="contacto@empresa.com"
                    type="email"
                    required
                  />
                </div>
                <div className="field-col">
                  <label>Teléfono de la Empresa *</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+51 1 234-5678"
                    required
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Dirección</label>
                  <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Jr. Los Olivos 123, San Isidro"
                  />
                </div>
                <div className="field-col">
                  <label>Ciudad</label>
                  <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
                </div>
              </div>
            </section>

            {/* Sección de notas eliminada */}
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">{clientId ? 'Guardar Cambios' : 'Registrar Cliente'}</button>
        </div>
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

export default RegisterClient;
