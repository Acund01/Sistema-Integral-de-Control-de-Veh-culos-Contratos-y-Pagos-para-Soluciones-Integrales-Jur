import React, { useState, useRef, useEffect } from 'react';
import '../styles/ClientCard.css';
import type { Client } from '../types/client';

interface ClientCardProps {
  client: Client;
  onViewDetails?: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onViewDetails, onEditClient, onDeleteClient }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleView = () => {
    if (onViewDetails) onViewDetails(client);
    setOpen(false);
  };

  const handleEdit = () => {
    if (onEditClient) onEditClient(client);
    setOpen(false);
  };

  const handleDelete = () => {
    if (onDeleteClient) {
      if (confirm(`¿Eliminar al cliente "${client.name}"?`)) {
        onDeleteClient(client.id);
      }
    }
    setOpen(false);
  };

  return (
    <div className="client-card">
      <div className="client-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path>
          <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" stroke-width="0" fill="currentColor">

          </path>
        </svg>
      </div>
      
      <div className="client-info">
        <h3 className="client-name">{client.name}</h3>
        <div className="client-details">
          <span className="client-detail">
            <span className="detail-icon">✉️</span>
            {client.email}
          </span>
          <span className="client-detail">
            <span className="detail-icon">📞</span>
            {client.phone}
          </span>
          <span className="client-detail">
            <span className="detail-icon">📍</span>
            {client.location}
          </span>
        </div>
      </div>

      <div className="client-contracts">
        <span className="contracts-number">{client.contracts}</span>
        <span className="contracts-label">Contratos</span>
      </div>

      <div className="client-status">
        <span className={`status-badge ${client.status.toLowerCase()}`}>
          {client.status}
        </span>
      </div>

      <div className="client-menu-wrapper" ref={menuRef}>
        <button className="client-menu-btn" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
          ⋯
        </button>
        {open && (
          <div className="client-menu" role="menu">
            <button className="client-menu-item" onClick={handleView} role="menuitem">
              <span className="menu-icon">👁</span> Ver detalles
            </button>
            <button className="client-menu-item" onClick={handleEdit} role="menuitem">
              <span className="menu-icon">✏️</span> Editar cliente
            </button>
            <button className="client-menu-item danger" onClick={handleDelete} role="menuitem">
              <span className="menu-icon">🗑</span> Eliminar cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
