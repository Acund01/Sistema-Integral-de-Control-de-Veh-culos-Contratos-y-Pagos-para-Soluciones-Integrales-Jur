package com.grupodos.alquilervehiculos.msvcreportes.controllers;

import com.grupodos.alquilervehiculos.msvcreportes.dto.ReporteIngresosDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ReportePagosDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ReporteRequest;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ReporteUsoVehiculosDto;
import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.services.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:3000")
public class ReporteController {

    private static final Logger logger = LoggerFactory.getLogger(ReporteController.class);

    private final ReporteConsultaService reporteConsultaService;
    private final ReportePagosService reportePagosService;
    private final ReporteUsoVehiculosService reporteUsoVehiculosService;
    private final ReporteIngresosService reporteIngresosService;
    private final ExcelGeneratorService excelGeneratorService;

    public ReporteController(ReporteConsultaService  reporteConsultaService,
                             ReportePagosService reportePagosService,
                             ReporteUsoVehiculosService reporteUsoVehiculosService,
                             ReporteIngresosService reporteIngresosService,
                             ExcelGeneratorService excelGeneratorService) {
        this.reporteConsultaService = reporteConsultaService;
        this.reportePagosService = reportePagosService;
        this.reporteUsoVehiculosService = reporteUsoVehiculosService;
        this.reporteIngresosService = reporteIngresosService;
        this.excelGeneratorService = excelGeneratorService;
    }

    @PostMapping("/pagos/excel")
    public ResponseEntity<Resource> generarReportePagosExcel(@Valid @RequestBody ReporteRequest request) {
        try {
            logger.info("Solicitando reporte de pagos en Excel: {} a {}", request.fechaInicio(), request.fechaFin());

            List<ReportePagosDto> datos = reportePagosService.generarReportePagos(
                    request.fechaInicio(), request.fechaFin());

            byte[] excelBytes = excelGeneratorService.generarReportePagosExcel(datos,
                    "Reporte de Pagos - " + request.fechaInicio() + " a " + request.fechaFin());

            String filename = String.format("reporte-pagos-%s-a-%s.xlsx",
                    request.fechaInicio().format(DateTimeFormatter.BASIC_ISO_DATE),
                    request.fechaFin().format(DateTimeFormatter.BASIC_ISO_DATE));

            return construirRespuestaDescarga(excelBytes, filename);

        } catch (IOException e) {
            logger.error("Error generando Excel de reporte de pagos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/uso-vehiculos/excel")
    public ResponseEntity<Resource> generarReporteUsoVehiculosExcel(@Valid @RequestBody ReporteRequest request) {
        try {
            logger.info("Solicitando reporte de uso de vehículos en Excel: {} a {}",
                    request.fechaInicio(), request.fechaFin());

            List<ReporteUsoVehiculosDto> datos = reporteUsoVehiculosService.generarReporteUsoVehiculos(
                    request.fechaInicio(), request.fechaFin());

            byte[] excelBytes = excelGeneratorService.generarReporteUsoVehiculosExcel(datos,
                    "Reporte de Uso de Vehículos - " + request.fechaInicio() + " a " + request.fechaFin());

            String filename = String.format("reporte-uso-vehiculos-%s-a-%s.xlsx",
                    request.fechaInicio().format(DateTimeFormatter.BASIC_ISO_DATE),
                    request.fechaFin().format(DateTimeFormatter.BASIC_ISO_DATE));

            return construirRespuestaDescarga(excelBytes, filename);

        } catch (IOException e) {
            logger.error("Error generando Excel de reporte de uso de vehículos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ingresos-mensuales/{año}/excel")
    public ResponseEntity<Resource> generarReporteIngresosMensualesExcel(@PathVariable Integer año) {
        try {
            logger.info("Solicitando reporte de ingresos mensuales en Excel para el año {}", año);

            List<ReporteIngresosDto> datos = reporteIngresosService.generarReporteIngresosMensuales(año);

            byte[] excelBytes = excelGeneratorService.generarReporteIngresosExcel(datos,
                    "Reporte de Ingresos Mensuales - Año " + año);

            String filename = String.format("reporte-ingresos-mensuales-%d.xlsx", año);

            return construirRespuestaDescarga(excelBytes, filename);

        } catch (IOException e) {
            logger.error("Error generando Excel de reporte de ingresos mensuales: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoints para obtener datos en JSON (frontend)
    @PostMapping("/pagos/datos")
    public ResponseEntity<List<ReportePagosDto>> obtenerDatosReportePagos(@Valid @RequestBody ReporteRequest request) {
        logger.info("Obteniendo datos de reporte de pagos: {} a {}", request.fechaInicio(), request.fechaFin());

        List<ReportePagosDto> datos = reportePagosService.generarReportePagos(
                request.fechaInicio(), request.fechaFin());

        return ResponseEntity.ok(datos);
    }

    @PostMapping("/uso-vehiculos/datos")
    public ResponseEntity<List<ReporteUsoVehiculosDto>> obtenerDatosReporteUsoVehiculos(@Valid @RequestBody ReporteRequest request) {
        logger.info("Obteniendo datos de reporte de uso de vehículos: {} a {}", request.fechaInicio(), request.fechaFin());

        List<ReporteUsoVehiculosDto> datos = reporteUsoVehiculosService.generarReporteUsoVehiculos(
                request.fechaInicio(), request.fechaFin());

        return ResponseEntity.ok(datos);
    }

    @GetMapping("/ingresos-mensuales/{año}/datos")
    public ResponseEntity<List<ReporteIngresosDto>> obtenerDatosReporteIngresosMensuales(@PathVariable Integer año) {
        logger.info("Obteniendo datos de reporte de ingresos mensuales para el año {}", año);

        List<ReporteIngresosDto> datos = reporteIngresosService.generarReporteIngresosMensuales(año);

        return ResponseEntity.ok(datos);
    }

    private ResponseEntity<Resource> construirRespuestaDescarga(byte[] contenido, String filename) {
        ByteArrayResource resource = new ByteArrayResource(contenido);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contenido.length))
                .body(resource);
    }

    // Consultas de reporte
    @GetMapping("/generados")
    public ResponseEntity<List<Reporte>> obtenerTodosLosReportes() {
        List<Reporte> reportes = reporteConsultaService.obtenerTodosLosReportes();
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/generados/{id}")
    public ResponseEntity<Reporte> obtenerReportePorId(@PathVariable UUID id) {
        Optional<Reporte> reporte = reporteConsultaService.obtenerReportePorId(id);
        return reporte.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/generados/tipo/{tipoReporte}")
    public ResponseEntity<List<Reporte>> obtenerReportesPorTipo(@PathVariable String tipoReporte) {
        List<Reporte> reportes = reporteConsultaService.obtenerReportesPorTipo(tipoReporte);
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/generados/fecha/{desde}/{hasta}")
    public ResponseEntity<List<Reporte>> obtenerReportesPorRangoFechas(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        List<Reporte> reportes = reporteConsultaService.obtenerReportesPorRangoFechas(desde, hasta);
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/generados/ultimos")
    public ResponseEntity<List<Reporte>> obtenerUltimosReportes(@RequestParam(defaultValue = "10") int cantidad) {
        List<Reporte> reportes = reporteConsultaService.obtenerUltimosReportes(cantidad);
        return ResponseEntity.ok(reportes);
    }
}
