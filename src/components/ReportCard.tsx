import React, { useState } from 'react';
import '../styles/ReportCard.css';
import type { ReportType } from '../types/report';
import { downloadReportExcel } from '../services/reporteService';

interface ReportCardProps {
  report: ReportType;
  onDownload?: (r: ReportType) => void;
  onGenerate?: (r: ReportType) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onDownload, onGenerate }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (onDownload) return onDownload(report);
    try {
      setLoading(true);
      const meta = report as Partial<{ id: string; endpoint: string }>;
      const path = meta.endpoint ?? `/excel/${meta.id ?? ''}`;
      await downloadReportExcel(path);
    } catch (e) {
      alert((e as Error)?.message || 'Error al descargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => onGenerate?.(report);

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
        <button className="btn-primary" onClick={handleDownload} disabled={loading}>
          {loading ? 'Descargando…' : 'Descargar Excel'}
        </button>
        {onGenerate && (
          <button className="btn-secondary" onClick={handleGenerate}>Generar</button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
