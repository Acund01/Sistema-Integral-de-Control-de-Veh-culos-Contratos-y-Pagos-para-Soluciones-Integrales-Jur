import React from 'react';
import '../styles/ReportCard.css';
import type { ReportType } from '../types/report';

interface ReportCardProps {
  report: ReportType;
  onDownload?: (r: ReportType) => Promise<void> | void;
  onGenerate?: (r: ReportType) => Promise<void> | void;
  downloading?: boolean;
  generating?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onDownload, onGenerate, downloading, generating }) => {
  return (
    <div className="report-card">
      <div className="report-card-content">
        <div className="report-icon-wrapper">
          <span className="report-icon">{report.icon}</span>
        </div>
        <div className="report-info">
          <h3 className="report-title">{report.title}</h3>
          <p className="report-description">{report.description}</p>
        </div>
      </div>
      <div className="report-actions">
        {onDownload && (
          <button className="btn-primary" onClick={() => onDownload(report)} disabled={!!downloading || !!generating}>
            {downloading ? 'Descargando…' : 'Descargar Excel'}
          </button>
        )}
        {onGenerate && (
          <button className="btn-secondary" onClick={() => onGenerate(report)} disabled={!!downloading || !!generating}>
            {generating ? 'Generando…' : 'Generar'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
