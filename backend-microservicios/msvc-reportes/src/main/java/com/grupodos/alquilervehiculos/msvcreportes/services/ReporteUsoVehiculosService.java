package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.clients.ContratoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.clients.VehiculoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.dto.*;
import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.repositories.ReporteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteUsoVehiculosService {

    private static final Logger logger = LoggerFactory.getLogger(ReporteUsoVehiculosService.class);

    private final ContratoFeignClient contratoClient;
    private final VehiculoFeignClient vehiculoClient;
    private final ReporteRepository reporteRepository;

    public ReporteUsoVehiculosService(ContratoFeignClient contratoClient, VehiculoFeignClient vehiculoClient,  ReporteRepository reporteRepository) {
        this.contratoClient = contratoClient;
        this.vehiculoClient = vehiculoClient;
        this.reporteRepository = reporteRepository;
    }

    public List<ReporteUsoVehiculosDto> generarReporteUsoVehiculos(LocalDate fechaInicio, LocalDate fechaFin) {
        logger.info("Generando reporte de uso de vehículos desde {} hasta {}", fechaInicio, fechaFin);

        try {
            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);
            List<ContratoDto> contratos = contratoClient.obtenerContratosPorRangoFechas(request);
            List<VehiculoDto> vehiculos = vehiculoClient.obtenerTodosVehiculos();

            // Agrupar detalles por vehículo
            Map<String, List<DetalleContratoDto>> detallesPorVehiculo = contratos.stream()
                    .flatMap(contrato -> contrato.detalles().stream())
                    .collect(Collectors.groupingBy(DetalleContratoDto::placaVehiculo));

            // Calcular estadísticas por vehículo
            List<ReporteUsoVehiculosDto> reporte = new ArrayList<>();

            for (VehiculoDto vehiculo : vehiculos) {
                List<DetalleContratoDto> detalles = detallesPorVehiculo.getOrDefault(vehiculo.placa(), Collections.emptyList());

                if (!detalles.isEmpty()) {
                    int totalDias = detalles.stream().mapToInt(DetalleContratoDto::diasAlquiler).sum();
                    BigDecimal totalRecaudado = detalles.stream()
                            .map(detalle -> BigDecimal.valueOf(detalle.subtotal()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    int cantidadContratos = (int) detalles.stream()
                            .map(DetalleContratoDto::idDetalle)
                            .distinct()
                            .count();

                    LocalDate ultimoAlquiler = contratos.stream()
                            .filter(contrato -> contrato.detalles().stream()
                                    .anyMatch(detalle -> vehiculo.placa().equals(detalle.placaVehiculo())))
                            .map(ContratoDto::fechaFin)
                            .max(LocalDate::compareTo)
                            .orElse(null);

                    // Calcular porcentaje de uso (simplificado)
                    long diasTotalesPeriodo = fechaInicio.until(fechaFin).getDays() + 1;
                    double porcentajeUso = (double) totalDias / diasTotalesPeriodo * 100;

                    ReporteUsoVehiculosDto dto = new ReporteUsoVehiculosDto(
                            vehiculo.placa(),
                            vehiculo.marca(),
                            vehiculo.modelo(),
                            vehiculo.tipoVehiculo(),
                            totalDias,
                            cantidadContratos,
                            totalRecaudado,
                            Math.min(porcentajeUso, 100.0), // Máximo 100%
                            ultimoAlquiler
                    );

                    reporte.add(dto);
                }
            }

            // Ordenar por total recaudado descendente
            reporte.sort((a, b) -> b.totalRecaudado().compareTo(a.totalRecaudado()));

            Reporte registroReporte = new Reporte();
            registroReporte.setTipoReporte("USO_VEHICULOS");
            registroReporte.setFormato("EXCEL");
            registroReporte.setNombreArchivo("reporte-uso-vehiculos-" + fechaInicio + "-a-" + fechaFin + ".xlsx");
            registroReporte.setGeneradoPor("SISTEMA");
            registroReporte.setParametros("FechaInicio: " + fechaInicio + ", FechaFin: " + fechaFin);
            registroReporte.setFechaGeneracion(LocalDateTime.now());
            reporteRepository.save(registroReporte);

            logger.info("Reporte de uso de vehículos generado con {} registros", reporte.size());
            return reporte;

        } catch (Exception e) {
            logger.error("Error generando reporte de uso de vehículos: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar reporte de uso de vehículos: " + e.getMessage());
        }
    }
}
