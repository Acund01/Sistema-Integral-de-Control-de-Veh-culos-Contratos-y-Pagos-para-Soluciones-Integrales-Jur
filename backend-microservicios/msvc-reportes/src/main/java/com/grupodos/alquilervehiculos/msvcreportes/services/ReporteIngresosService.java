package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.clients.ContratoFeignClient;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReporteIngresosService {

    private final ContratoFeignClient contratoClient;
    private final ReporteRepository reporteRepository;

    public ReporteIngresosService(ContratoFeignClient contratoClient,  ReporteRepository reporteRepository) {
        this.contratoClient = contratoClient;
        this.reporteRepository = reporteRepository;
    }

    public List<ReporteIngresosDto> generarReporteIngresosMensuales(Integer anio) {
        log.info("Generando reporte de ingresos mensuales para el año {}", anio);

        validarAnio(anio);

        try {
            LocalDate fechaInicio = LocalDate.of(anio, 1, 1);
            LocalDate fechaFin = LocalDate.of(anio, 12, 31);

            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);
            List<ContratoDto> contratos = contratoClient.obtenerContratosPorRangoFechas(request);
            List<ComprobanteDto> comprobantes = contratoClient.obtenerComprobantesPorRangoFechas(request);

            // Agrupar por mes
            Map<YearMonth, List<ContratoDto>> contratosPorMes = contratos.stream()
                    .filter(contrato -> contrato.fechaCreacion() != null)
                    .collect(Collectors.groupingBy(contrato ->
                            YearMonth.from(contrato.fechaCreacion().toLocalDate())));

            Map<YearMonth, List<ComprobanteDto>> comprobantesPorMes = comprobantes.stream()
                    .filter(comprobante -> comprobante.fechaEmision() != null)
                    .collect(Collectors.groupingBy(comprobante ->
                            YearMonth.from(comprobante.fechaEmision().toLocalDate())));

            List<ReporteIngresosDto> reporte = new ArrayList<>();

            // Procesar cada mes del año
            for (int mes = 1; mes <= 12; mes++) {
                YearMonth yearMonth = YearMonth.of(anio, mes);

                List<ContratoDto> contratosMes = contratosPorMes.getOrDefault(yearMonth, Collections.emptyList());
                List<ComprobanteDto> comprobantesMes = comprobantesPorMes.getOrDefault(yearMonth, Collections.emptyList());

                if (!contratosMes.isEmpty() || !comprobantesMes.isEmpty()) {
                    BigDecimal totalIngresos = comprobantesMes.stream()
                            .map(ComprobanteDto::total)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal igvRecaudado = comprobantesMes.stream()
                            .map(ComprobanteDto::igv)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    int totalContratos = contratosMes.size();
                    BigDecimal promedioPorContrato = totalContratos > 0 ?
                            totalIngresos.divide(BigDecimal.valueOf(totalContratos), 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    // Estadísticas adicionales
                    long cantidadClientes = contratosMes.stream()
                            .map(ContratoDto::idCliente)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();

                    long cantidadVehiculos = contratosMes.stream()
                            .flatMap(contrato -> contrato.detalles().stream())
                            .map(DetalleContratoDto::idVehiculo)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();

                    ReporteIngresosDto dto = new ReporteIngresosDto(
                            yearMonth,
                            totalContratos,
                            totalIngresos,
                            promedioPorContrato,
                            igvRecaudado,
                            (int) cantidadClientes,
                            (int) cantidadVehiculos
                    );

                    reporte.add(dto);
                }
            }

            // Guardar registro del reporte
            guardarRegistroReporte(anio, reporte.size());

            log.info("Reporte de ingresos mensuales generado con {} meses con datos", reporte.size());
            return reporte;

        } catch (FeignException e) {
            log.error("Error Feign generando reporte de ingresos: status={}, message={}", e.status(), e.getMessage());
            throw new FeignClientException("msvc-contratos", "Error al obtener datos para reporte de ingresos", e.status());
        } catch (Exception e) {
            log.error("Error generando reporte de ingresos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error al generar reporte de ingresos: " + e.getMessage(), e);
        }
    }

    private void validarAnio(Integer anio) {
        if (anio == null) {
            throw new IllegalArgumentException("El año es requerido");
        }

        int anioActual = LocalDate.now().getYear();
        if (anio < 2020) {
            throw new IllegalArgumentException("El año debe ser 2020 o posterior");
        }
        if (anio > anioActual + 1) {
            throw new IllegalArgumentException("El año no puede ser mayor a " + (anioActual + 1));
        }
    }

    private void guardarRegistroReporte(Integer anio, int cantidadMeses) {
        try {
            Reporte registroReporte = new Reporte();
            registroReporte.setTipoReporte("INGRESOS_MENSUALES");
            registroReporte.setFormato("EXCEL");
            registroReporte.setNombreArchivo("reporte-ingresos-mensuales-" + anio + ".xlsx");
            registroReporte.setFechaGeneracion(LocalDateTime.now());
            registroReporte.setGeneradoPor("SISTEMA");
            registroReporte.setParametros("Año: " + anio + ", Meses con datos: " + cantidadMeses);
            reporteRepository.save(registroReporte);

            log.debug("Registro de reporte de ingresos guardado exitosamente");
        } catch (Exception e) {
            log.error("Error guardando registro del reporte de ingresos: {}", e.getMessage());
            // No lanzamos excepción para no afectar la generación del reporte principal
        }
    }

    // Método adicional para generar reporte de ingresos por rango de fechas específico
    public List<ReporteIngresosDto> generarReporteIngresosPorRango(LocalDate fechaInicio, LocalDate fechaFin) {
        log.info("Generando reporte de ingresos desde {} hasta {}", fechaInicio, fechaFin);

        // Validar rango de fechas
        validarRangoFechas(fechaInicio, fechaFin);

        try {
            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);
            List<ContratoDto> contratos = contratoClient.obtenerContratosPorRangoFechas(request);
            List<ComprobanteDto> comprobantes = contratoClient.obtenerComprobantesPorRangoFechas(request);

            log.debug("Contratos obtenidos: {}, Comprobantes obtenidos: {}",
                    contratos != null ? contratos.size() : "NULL",
                    comprobantes != null ? comprobantes.size() : "NULL");

            if ((contratos == null || contratos.isEmpty()) && (comprobantes == null || comprobantes.isEmpty())) {
                log.warn("No se encontraron datos para el rango de fechas indicado");
                return Collections.emptyList();
            }

            // Calcular totales generales para el período
            BigDecimal totalIngresos = comprobantes.stream()
                    .map(ComprobanteDto::total)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal igvRecaudado = comprobantes.stream()
                    .map(ComprobanteDto::igv)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int totalContratos = contratos.size();
            BigDecimal promedioPorContrato = totalContratos > 0 ?
                    totalIngresos.divide(BigDecimal.valueOf(totalContratos), 2, RoundingMode.HALF_UP) :
                    BigDecimal.ZERO;

            // Estadísticas adicionales
            long cantidadClientes = contratos.stream()
                    .map(ContratoDto::idCliente)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            long cantidadVehiculos = contratos.stream()
                    .flatMap(contrato -> contrato.detalles().stream())
                    .map(DetalleContratoDto::idVehiculo)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            // Crear un solo registro para el período completo
            YearMonth periodo = YearMonth.from(fechaInicio);
            List<ReporteIngresosDto> reporte = Collections.singletonList(
                    new ReporteIngresosDto(
                            periodo,
                            totalContratos,
                            totalIngresos,
                            promedioPorContrato,
                            igvRecaudado,
                            (int) cantidadClientes,
                            (int) cantidadVehiculos
                    )
            );

            // Guardar registro del reporte
            guardarRegistroReporteRango(fechaInicio, fechaFin, totalContratos);

            log.info("Reporte de ingresos por rango generado con {} contratos", totalContratos);
            return reporte;

        } catch (FeignException e) {
            log.error("Error Feign generando reporte de ingresos por rango: status={}, message={}", e.status(), e.getMessage());
            throw new FeignClientException("msvc-contratos", "Error al obtener datos para reporte de ingresos", e.status());
        } catch (Exception e) {
            log.error("Error generando reporte de ingresos por rango: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error al generar reporte de ingresos por rango: " + e.getMessage(), e);
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

        long diasDiferencia = ChronoUnit.DAYS.between(fechaInicio, fechaFin);
        if (diasDiferencia > 365) {
            throw new InvalidDateRangeException("El rango de fechas no puede ser mayor a 1 año");
        }
    }

    private void guardarRegistroReporteRango(LocalDate fechaInicio, LocalDate fechaFin, int cantidadContratos) {
        try {
            Reporte registroReporte = new Reporte();
            registroReporte.setTipoReporte("INGRESOS_RANGO");
            registroReporte.setFormato("EXCEL");
            registroReporte.setNombreArchivo("reporte-ingresos-" + fechaInicio + "-a-" + fechaFin + ".xlsx");
            registroReporte.setFechaGeneracion(LocalDateTime.now());
            registroReporte.setGeneradoPor("SISTEMA");
            registroReporte.setParametros("FechaInicio: " + fechaInicio + ", FechaFin: " + fechaFin + ", Contratos: " + cantidadContratos);
            reporteRepository.save(registroReporte);

            log.debug("Registro de reporte de ingresos por rango guardado exitosamente");
        } catch (Exception e) {
            log.error("Error guardando registro del reporte de ingresos por rango: {}", e.getMessage());
        }
    }
}
