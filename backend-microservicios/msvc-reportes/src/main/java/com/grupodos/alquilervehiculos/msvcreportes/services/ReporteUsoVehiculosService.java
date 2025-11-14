package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.clients.ContratoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.clients.VehiculoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.dto.*;
import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.exceptions.FeignClientException;
import com.grupodos.alquilervehiculos.msvcreportes.exceptions.InvalidDateRangeException;
import com.grupodos.alquilervehiculos.msvcreportes.exceptions.ReporteGenerationException;
import com.grupodos.alquilervehiculos.msvcreportes.repositories.ReporteRepository;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReporteUsoVehiculosService {

    private final ContratoFeignClient contratoClient;
    private final VehiculoFeignClient vehiculoClient;
    private final ReporteRepository reporteRepository;

    public ReporteUsoVehiculosService(ContratoFeignClient contratoClient, VehiculoFeignClient vehiculoClient,  ReporteRepository reporteRepository) {
        this.contratoClient = contratoClient;
        this.vehiculoClient = vehiculoClient;
        this.reporteRepository = reporteRepository;
    }

    public List<ReporteUsoVehiculosDto> generarReporteUsoVehiculos(LocalDate fechaInicio, LocalDate fechaFin) {
        log.info("Generando reporte de uso de vehículos desde {} hasta {}", fechaInicio, fechaFin);

        // Validar rango de fechas
        validarRangoFechas(fechaInicio, fechaFin);

        try {
            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);

            // Obtener datos de contratos
            List<ContratoDto> contratos = contratoClient.obtenerContratosPorRangoFechas(request);
            log.debug("Contratos obtenidos: {}", contratos != null ? contratos.size() : "NULL");

            // Obtener datos de vehículos
            List<VehiculoDto> vehiculos = vehiculoClient.obtenerVehiculosParaReportes();
            log.debug("Vehículos obtenidos: {}", vehiculos != null ? vehiculos.size() : "NULL");

            if ((contratos == null || contratos.isEmpty()) || (vehiculos == null || vehiculos.isEmpty())) {
                log.warn("No se encontraron datos suficientes para generar el reporte");
                return Collections.emptyList();
            }

            // Agrupar detalles por vehículo usando placa como clave
            Map<String, List<DetalleContratoDto>> detallesPorVehiculo = contratos.stream()
                    .filter(contrato -> contrato.detalles() != null)
                    .flatMap(contrato -> contrato.detalles().stream())
                    .filter(detalle -> detalle.placaVehiculo() != null)
                    .collect(Collectors.groupingBy(DetalleContratoDto::placaVehiculo));

            // Crear mapa de vehículos por placa para acceso rápido
            Map<String, VehiculoDto> vehiculoMap = vehiculos.stream()
                    .filter(vehiculo -> vehiculo.placa() != null)
                    .collect(Collectors.toMap(
                            VehiculoDto::placa,
                            vehiculo -> vehiculo,
                            (existing, replacement) -> existing // En caso de duplicados, mantener el primero
                    ));

            // Calcular estadísticas por vehículo
            List<ReporteUsoVehiculosDto> reporte = new ArrayList<>();

            for (VehiculoDto vehiculo : vehiculos) {
                if (vehiculo.placa() == null) {
                    log.warn("Vehículo sin placa encontrado, omitiendo: {}", vehiculo);
                    continue;
                }

                List<DetalleContratoDto> detalles = detallesPorVehiculo.getOrDefault(vehiculo.placa(), Collections.emptyList());

                if (!detalles.isEmpty()) {
                    int totalDias = detalles.stream()
                            .mapToInt(DetalleContratoDto::diasAlquiler)
                            .sum();

                    BigDecimal totalRecaudado = detalles.stream()
                            .map(detalle -> BigDecimal.valueOf(detalle.subtotal()))
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    int cantidadContratos = (int) detalles.stream()
                            .map(DetalleContratoDto::idDetalle)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();

                    LocalDate ultimoAlquiler = contratos.stream()
                            .filter(contrato -> contrato.detalles() != null)
                            .filter(contrato -> contrato.detalles().stream()
                                    .anyMatch(detalle -> vehiculo.placa().equals(detalle.placaVehiculo())))
                            .map(ContratoDto::fechaFin)
                            .filter(Objects::nonNull)
                            .max(LocalDate::compareTo)
                            .orElse(null);

                    // Calcular porcentaje de uso
                    long diasTotalesPeriodo = ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1;
                    double porcentajeUso = diasTotalesPeriodo > 0 ?
                            ((double) totalDias / diasTotalesPeriodo) * 100.0 : 0.0;

                    ReporteUsoVehiculosDto dto = new ReporteUsoVehiculosDto(
                            vehiculo.placa(),
                            vehiculo.marca(),
                            vehiculo.modelo(),
                            vehiculo.tipoVehiculo(),
                            totalDias,
                            cantidadContratos,
                            totalRecaudado,
                            Math.min(Math.max(porcentajeUso, 0.0), 100.0), // Asegurar entre 0% y 100%
                            ultimoAlquiler
                    );

                    reporte.add(dto);
                } else {
                    // Incluir vehículos sin uso en el período
                    ReporteUsoVehiculosDto dto = new ReporteUsoVehiculosDto(
                            vehiculo.placa(),
                            vehiculo.marca(),
                            vehiculo.modelo(),
                            vehiculo.tipoVehiculo(),
                            0, // Sin días alquilados
                            0, // Sin contratos
                            BigDecimal.ZERO, // Sin recaudación
                            0.0, // 0% de uso
                            null // Sin último alquiler
                    );
                    reporte.add(dto);
                }
            }

            // Ordenar por total recaudado descendente (los que más generan primero)
            reporte.sort((a, b) -> b.totalRecaudado().compareTo(a.totalRecaudado()));

            // Guardar registro del reporte
            guardarRegistroReporte(fechaInicio, fechaFin, reporte.size());

            log.info("Reporte de uso de vehículos generado con {} registros", reporte.size());
            return reporte;

        } catch (FeignException e) {
            log.error("Error Feign generando reporte de uso de vehículos: status={}, message={}", e.status(), e.getMessage());

            String servicio = determinarServicioError(e);
            throw new FeignClientException(servicio, "Error al obtener datos para reporte de uso de vehículos", e.status());
        } catch (Exception e) {
            log.error("Error generando reporte de uso de vehículos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error al generar reporte de uso de vehículos: " + e.getMessage(), e);
        }
    }

    private void validarRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaInicio == null || fechaFin == null) {
            throw new InvalidDateRangeException("Las fechas de inicio y fin son requeridas");
        }
        if (fechaFin.isBefore(fechaInicio)) {
            throw new InvalidDateRangeException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        if (fechaInicio.isAfter(LocalDate.now())) {
            throw new InvalidDateRangeException("La fecha de inicio no puede ser en el futuro");
        }

        // Validar que el rango no sea muy amplio
        long diasDiferencia = ChronoUnit.DAYS.between(fechaInicio, fechaFin);
        if (diasDiferencia > 365) {
            throw new InvalidDateRangeException("El rango de fechas no puede ser mayor a 1 año");
        }
        if (diasDiferencia < 1) {
            throw new InvalidDateRangeException("El rango de fechas debe ser de al menos 1 día");
        }
    }

    private String determinarServicioError(FeignException e) {
        // Analizar el mensaje de error para determinar qué servicio falló
        String errorMessage = e.getMessage();
        if (errorMessage != null) {
            if (errorMessage.toLowerCase().contains("contrato") || errorMessage.contains("msvc-contratos")) {
                return "msvc-contratos";
            } else if (errorMessage.toLowerCase().contains("vehiculo") || errorMessage.contains("msvc-vehiculos")) {
                return "msvc-vehiculos";
            }
        }
        return "microservicio-externo";
    }

    private void guardarRegistroReporte(LocalDate fechaInicio, LocalDate fechaFin, int cantidadRegistros) {
        try {
            Reporte registroReporte = new Reporte();
            registroReporte.setTipoReporte("USO_VEHICULOS");
            registroReporte.setFormato("EXCEL");
            registroReporte.setNombreArchivo("reporte-uso-vehiculos-" + fechaInicio + "-a-" + fechaFin + ".xlsx");
            registroReporte.setGeneradoPor("SISTEMA");
            registroReporte.setParametros("FechaInicio: " + fechaInicio +
                    ", FechaFin: " + fechaFin +
                    ", Vehículos: " + cantidadRegistros);
            registroReporte.setFechaGeneracion(LocalDateTime.now());
            reporteRepository.save(registroReporte);

            log.debug("Registro de reporte de uso de vehículos guardado exitosamente");
        } catch (Exception e) {
            log.error("Error guardando registro del reporte de uso de vehículos: {}", e.getMessage());
            // No lanzamos excepción para no afectar la generación del reporte principal
        }
    }

    // Metodo adicional para obtener estadísticas resumidas
    public Map<String, Object> obtenerEstadisticasUsoVehiculos(LocalDate fechaInicio, LocalDate fechaFin) {
        log.info("Generando estadísticas de uso de vehículos desde {} hasta {}", fechaInicio, fechaFin);

        validarRangoFechas(fechaInicio, fechaFin);

        try {
            List<ReporteUsoVehiculosDto> reporteCompleto = generarReporteUsoVehiculos(fechaInicio, fechaFin);

            // Calcular estadísticas resumidas
            int totalVehiculos = reporteCompleto.size();
            int vehiculosConUso = (int) reporteCompleto.stream()
                    .filter(vehiculo -> vehiculo.cantidadContratos() > 0)
                    .count();

            BigDecimal totalRecaudadoGeneral = reporteCompleto.stream()
                    .map(ReporteUsoVehiculosDto::totalRecaudado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int totalDiasAlquilados = reporteCompleto.stream()
                    .mapToInt(ReporteUsoVehiculosDto::totalDiasAlquilados)
                    .sum();

            int totalContratos = reporteCompleto.stream()
                    .mapToInt(ReporteUsoVehiculosDto::cantidadContratos)
                    .sum();

            // Vehículo más rentable
            Optional<ReporteUsoVehiculosDto> vehiculoMasRentable = reporteCompleto.stream()
                    .max(Comparator.comparing(ReporteUsoVehiculosDto::totalRecaudado));

            Map<String, Object> estadisticas = new LinkedHashMap<>();
            estadisticas.put("periodo", fechaInicio + " a " + fechaFin);
            estadisticas.put("totalVehiculos", totalVehiculos);
            estadisticas.put("vehiculosConUso", vehiculosConUso);
            estadisticas.put("vehiculosSinUso", totalVehiculos - vehiculosConUso);
            estadisticas.put("totalRecaudado", totalRecaudadoGeneral);
            estadisticas.put("totalDiasAlquilados", totalDiasAlquilados);
            estadisticas.put("totalContratos", totalContratos);
            estadisticas.put("promedioContratosPorVehiculo", totalVehiculos > 0 ?
                    (double) totalContratos / totalVehiculos : 0.0);

            if (vehiculoMasRentable.isPresent()) {
                ReporteUsoVehiculosDto masRentable = vehiculoMasRentable.get();
                Map<String, Object> infoMasRentable = new LinkedHashMap<>();
                infoMasRentable.put("placa", masRentable.placa());
                infoMasRentable.put("marca", masRentable.marca());
                infoMasRentable.put("modelo", masRentable.modelo());
                infoMasRentable.put("totalRecaudado", masRentable.totalRecaudado());
                infoMasRentable.put("contratos", masRentable.cantidadContratos());
                estadisticas.put("vehiculoMasRentable", infoMasRentable);
            }

            log.info("Estadísticas de uso generadas para {} vehículos", totalVehiculos);
            return estadisticas;

        } catch (Exception e) {
            log.error("Error generando estadísticas de uso de vehículos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error al generar estadísticas de uso de vehículos: " + e.getMessage(), e);
        }
    }
}
