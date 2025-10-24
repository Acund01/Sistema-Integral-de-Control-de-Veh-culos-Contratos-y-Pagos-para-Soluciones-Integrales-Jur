package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.clients.ContratoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.dto.*;
import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.repositories.ReporteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteIngresosService {

    private static final Logger logger = LoggerFactory.getLogger(ReporteIngresosService.class);

    private final ContratoFeignClient contratoClient;
    private final ReporteRepository reporteRepository;

    public ReporteIngresosService(ContratoFeignClient contratoClient,  ReporteRepository reporteRepository) {
        this.contratoClient = contratoClient;
        this.reporteRepository = reporteRepository;
    }

    public List<ReporteIngresosDto> generarReporteIngresosMensuales(Integer año) {
        logger.info("Generando reporte de ingresos mensuales para el año {}", año);

        try {
            LocalDate fechaInicio = LocalDate.of(año, 1, 1);
            LocalDate fechaFin = LocalDate.of(año, 12, 31);

            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);
            List<ContratoDto> contratos = contratoClient.obtenerContratosPorRangoFechas(request);
            List<ComprobanteDto> comprobantes = contratoClient.obtenerComprobantesPorRangoFechas(request);

            // Agrupar por mes
            Map<YearMonth, List<ContratoDto>> contratosPorMes = contratos.stream()
                    .collect(Collectors.groupingBy(contrato ->
                            YearMonth.from(contrato.fechaCreacion().toLocalDate())));

            Map<YearMonth, List<ComprobanteDto>> comprobantesPorMes = comprobantes.stream()
                    .collect(Collectors.groupingBy(comprobante ->
                            YearMonth.from(comprobante.fechaEmision().toLocalDate())));

            List<ReporteIngresosDto> reporte = new ArrayList<>();

            // Procesar cada mes del año
            for (int mes = 1; mes <= 12; mes++) {
                YearMonth yearMonth = YearMonth.of(año, mes);

                List<ContratoDto> contratosMes = contratosPorMes.getOrDefault(yearMonth, Collections.emptyList());
                List<ComprobanteDto> comprobantesMes = comprobantesPorMes.getOrDefault(yearMonth, Collections.emptyList());

                if (!contratosMes.isEmpty() || !comprobantesMes.isEmpty()) {
                    BigDecimal totalIngresos = comprobantesMes.stream()
                            .map(ComprobanteDto::total)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal igvRecaudado = comprobantesMes.stream()
                            .map(ComprobanteDto::igv)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    int totalContratos = contratosMes.size();
                    BigDecimal promedioPorContrato = totalContratos > 0 ?
                            totalIngresos.divide(BigDecimal.valueOf(totalContratos), 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    // Estadísticas adicionales
                    long cantidadClientes = contratosMes.stream()
                            .map(ContratoDto::idCliente)
                            .distinct()
                            .count();

                    long cantidadVehiculos = contratosMes.stream()
                            .flatMap(contrato -> contrato.detalles().stream())
                            .map(DetalleContratoDto::idVehiculo)
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
            Reporte registroReporte = new Reporte();
            registroReporte.setTipoReporte("INGRESOS_MENSUALES");
            registroReporte.setFormato("EXCEL");
            registroReporte.setNombreArchivo("reporte-ingresos-mensuales-" + año + ".xlsx");
            registroReporte.setFechaGeneracion(LocalDateTime.now());
            registroReporte.setGeneradoPor("SISTEMA");
            registroReporte.setParametros("Año: " + año);
            reporteRepository.save(registroReporte);

            logger.info("Reporte de ingresos mensuales generado con {} meses", reporte.size());
            return reporte;

        } catch (Exception e) {
            logger.error("Error generando reporte de ingresos mensuales: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar reporte de ingresos mensuales: " + e.getMessage());
        }
    }
}
