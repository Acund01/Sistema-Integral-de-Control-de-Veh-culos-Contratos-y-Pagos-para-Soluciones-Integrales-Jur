package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.exceptions.ReporteNotFoundException;
import com.grupodos.alquilervehiculos.msvcreportes.repositories.ReporteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReporteConsultaService {
    private static final Logger logger = LoggerFactory.getLogger(ReporteConsultaService.class);

    private final ReporteRepository reporteRepository;

    public ReporteConsultaService(ReporteRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    public List<Reporte> obtenerTodosLosReportes() {
        logger.info("Obteniendo todos los reportes generados");
        return reporteRepository.findAll();
    }

    public Optional<Reporte> obtenerReportePorId(UUID id) {
        logger.info("Obteniendo reporte con ID: {}", id);
        Optional<Reporte> reporte = reporteRepository.findById(id);

        if (reporte.isEmpty()) {
            throw new ReporteNotFoundException(id);
        }

        return reporte;
    }

    public List<Reporte> obtenerReportesPorTipo(String tipoReporte) {
        logger.info("Obteniendo reportes de tipo: {}", tipoReporte);
        List<Reporte> todos = reporteRepository.findAll();
        return todos.stream()
                .filter(r -> r.getTipoReporte().equalsIgnoreCase(tipoReporte))
                .collect(Collectors.toList());
    }

    public List<Reporte> obtenerReportesPorRangoFechas(LocalDate desde, LocalDate hasta) {
        logger.info("Obteniendo reportes desde {} hasta {}", desde, hasta);
        LocalDateTime fechaDesde = desde.atStartOfDay();
        LocalDateTime fechaHasta = hasta.atTime(23, 59, 59);

        List<Reporte> todos = reporteRepository.findAll();
        return todos.stream()
                .filter(r -> r.getFechaGeneracion() != null)
                .filter(r -> !r.getFechaGeneracion().isBefore(fechaDesde) &&
                        !r.getFechaGeneracion().isAfter(fechaHasta))
                .collect(Collectors.toList());
    }

    public List<Reporte> obtenerUltimosReportes(int cantidad) {
        logger.info("Obteniendo los últimos {} reportes", cantidad);
        List<Reporte> todos = reporteRepository.findAll();
        return todos.stream()
                .sorted((r1, r2) -> r2.getFechaGeneracion().compareTo(r1.getFechaGeneracion()))
                .limit(cantidad)
                .collect(Collectors.toList());
    }
}
