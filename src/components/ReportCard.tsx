import React from 'react';
import '../styles/ReportCard.css';
import type { ReportType } from '../types/report';

interface ReportCardProps {
  report: ReportType;
  onDownload: () => void;
  onGenerate: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onDownload, onGenerate }) => {
  return (
    <div className="report-card">
      <div className="report-card-content">
        <div className="report-icon-wrapper">
          <span className="report-icon">{report.icon}</span>
        </div>
        <div className="report-info">
          <h3 className="report-title">{report.title}</h3>
          <p className="report-description">{report.description}</p>
          <div className="report-meta">
            <span className="report-meta-item">Último generado: {report.lastGenerated}</span>
            <span className="report-meta-item">Período: {report.period}</span>
          </div>
        </div>
      </div>
      <div className="report-actions">
        <button className="btn-download" onClick={onDownload}>
          <span className="btn-icon">📥</span>
          Descargar
        </button>
        <button className="btn-generate" onClick={onGenerate}>
          <span className="btn-icon">📊</span>
          Generar
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
