import React, { useState } from 'react';
import '../styles/RegisterClient.css';
import type { Client } from '../types/client';

interface RegisterClientProps {
  onNavigate?: (menuId: string) => void;
  onAddClient?: (client: Partial<Client> & { nombres?: string; apellidos?: string; correo?: string; telefono?: string; ciudad?: string; }) => void;
}

const RegisterClient: React.FC<RegisterClientProps> = ({ onNavigate, onAddClient }) => {
  const [clientType, setClientType] = useState<'natural' | 'company'>('natural');

  // Datos comunes
  interface FormData {
    nombres?: string;
    apellidos?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    fechaNacimiento?: string;
    correo?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    contactoEmergenciaNombre?: string;
    contactoEmergenciaTelefono?: string;
    notas?: string;
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
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    notas: '',
    // Persona jurídica
    razonSocial: '',
    ruc: '',
    giroComercial: '',
    direccionFiscal: '',
    representanteNombres: '',
    representanteApellidos: '',
    representanteTipoDocumento: '',
    representanteNumeroDocumento: '',
    representanteCargo: '',
    representanteCorreo: '',
    representanteTelefono: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registrar cliente:', clientType, form);
    // Pasar al handler del padre para agregar al listado
    onAddClient?.(form);
    // Después de registrar, volver al listado
    onNavigate?.('clientes');
  };

  const handleCancel = () => {
    onNavigate?.('dashboard');
  };

  return (
    <div className="register-client page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Registrar Nuevo Cliente</h1>
          <p className="page-subtitle">Completa la información del cliente para agregarlo al sistema</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3 className="section-title">👤 Tipo de Cliente</h3>
          <div className="field-row">
            <label>Tipo de Cliente *</label>
            <select name="clientType" value={clientType} onChange={(e) => setClientType(e.target.value as 'natural' | 'company')}>
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
                  <input name="nombres" value={form.nombres} onChange={handleChange} placeholder="Juan Carlos" />
                </div>
                <div className="field-col">
                  <label>Apellidos *</label>
                  <input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Pérez García" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Tipo de Documento *</label>
                  <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}>
                    <option value="">Seleccionar tipo</option>
                    <option value="dni">DNI</option>
                    <option value="ce">Carné de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="field-col">
                  <label>Número de Documento *</label>
                  <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} placeholder="12345678" />
                </div>
                <div className="field-col">
                  <label>Fecha de Nacimiento</label>
                  <input name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} type="date" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">📬 Información de Contacto</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Correo Electrónico *</label>
                  <input name="correo" value={form.correo} onChange={handleChange} placeholder="juan.perez@email.com" />
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

            <section className="form-section">
              <h3 className="section-title">📞 Contacto de Emergencia</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Nombre del Contacto</label>
                  <input name="contactoEmergenciaNombre" value={form.contactoEmergenciaNombre} onChange={handleChange} placeholder="María García" />
                </div>
                <div className="field-col">
                  <label>Teléfono de Emergencia</label>
                  <input name="contactoEmergenciaTelefono" value={form.contactoEmergenciaTelefono} onChange={handleChange} placeholder="+51 1 987-6543" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col-full">
                  <label>Notas Adicionales</label>
                  <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Información adicional sobre el cliente..." />
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="form-section">
              <h3 className="section-title">🏢 Información de la Empresa</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Razón Social *</label>
                  <input name="razonSocial" value={form.razonSocial} onChange={handleChange} placeholder="Empresa Transportes SAC" />
                </div>
                <div className="field-col">
                  <label>RUC *</label>
                  <input name="ruc" value={form.ruc} onChange={handleChange} placeholder="20123456789" />
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
                  <input name="representanteNombres" value={form.representanteNombres} onChange={handleChange} placeholder="Carlos Antonio" />
                </div>
                <div className="field-col">
                  <label>Apellidos del Representante *</label>
                  <input name="representanteApellidos" value={form.representanteApellidos} onChange={handleChange} placeholder="López Silva" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Tipo de Documento *</label>
                  <select name="representanteTipoDocumento" value={form.representanteTipoDocumento} onChange={handleChange}>
                    <option value="">Seleccionar tipo</option>
                    <option value="dni">DNI</option>
                    <option value="ce">Carné de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="field-col">
                  <label>Número de Documento *</label>
                  <input name="representanteNumeroDocumento" value={form.representanteNumeroDocumento} onChange={handleChange} placeholder="87654321" />
                </div>
                <div className="field-col">
                  <label>Cargo</label>
                  <input name="representanteCargo" value={form.representanteCargo} onChange={handleChange} placeholder="Gerente General" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label>Correo del Representante *</label>
                  <input name="representanteCorreo" value={form.representanteCorreo} onChange={handleChange} placeholder="carlos.lopez@empresa.com" />
                </div>
                <div className="field-col">
                  <label>Teléfono del Representante</label>
                  <input name="representanteTelefono" value={form.representanteTelefono} onChange={handleChange} placeholder="+51 1 234-5678" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">📬 Información de Contacto Adicional</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Jr. Los Olivos 123, San Isidro" />
                </div>
                <div className="field-col">
                  <label>Ciudad</label>
                  <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">📞 Contacto de Emergencia</h3>
              <div className="field-row">
                <div className="field-col">
                  <label>Nombre del Contacto</label>
                  <input name="contactoEmergenciaNombre" value={form.contactoEmergenciaNombre} onChange={handleChange} placeholder="María García" />
                </div>
                <div className="field-col">
                  <label>Teléfono de Emergencia</label>
                  <input name="contactoEmergenciaTelefono" value={form.contactoEmergenciaTelefono} onChange={handleChange} placeholder="+51 1 987-6543" />
                </div>
              </div>

              <div className="field-row">
                <div className="field-col-full">
                  <label>Notas Adicionales</label>
                  <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Información adicional..." />
                </div>
              </div>
            </section>
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
          <button type="submit" className="btn-primary">Registrar Cliente</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterClient;
