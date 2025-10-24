package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.clients.ClienteFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.clients.ContratoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ClienteDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ComprobanteDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.RangoFechasRequest;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ReportePagosDto;
import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.repositories.ReporteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportePagosService {

    private static final Logger logger = LoggerFactory.getLogger(ReportePagosService.class);

    private final ContratoFeignClient contratoClient;
    private final ClienteFeignClient clienteClient;
    private final ReporteRepository reporteRepository;

    public ReportePagosService(ContratoFeignClient contratoClient, ClienteFeignClient clienteClient, ReporteRepository reporteRepository) {
        this.contratoClient = contratoClient;
        this.clienteClient = clienteClient;
        this.reporteRepository = reporteRepository;
    }

    public List<ReportePagosDto> generarReportePagos(LocalDate fechaInicio, LocalDate fechaFin) {
        logger.info("Generando reporte de pagos desde {} hasta {}", fechaInicio, fechaFin);
        try {
            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);
            List<ComprobanteDto> comprobantes = contratoClient.obtenerComprobantesPorRangoFechas(request);
            List<ClienteDto> clientes = clienteClient.obtenerTodosClientes();
            Map<UUID, ClienteDto> clientesMap = clientes.stream().collect(Collectors.toMap(ClienteDto::id, cliente -> cliente));
            List<ReportePagosDto> reporte = new ArrayList<>();

            for (ComprobanteDto comprobante : comprobantes) {
                String codigoContrato = "CT-" + comprobante.idContrato().toString().substring(0, 8);
                ClienteDto cliente = obtenerClienteParaComprobante(comprobante, clientesMap);
                ReportePagosDto dto = new ReportePagosDto(
                        comprobante.numeroSerie() + "-" + comprobante.numeroCorrelativo(),
                        comprobante.fechaEmision(),
                        comprobante.tipoComprobante(),
                        obtenerNombreCliente(cliente),
                        obtenerDocumentoCliente(cliente),
                        cliente.tipoCliente(),
                        comprobante.subtotal(),
                        comprobante.igv(),
                        comprobante.total(),
                        comprobante.estado(),
                        codigoContrato
                );
                reporte.add(dto);
            }

            // Guardar registro del reporte generado
            Reporte registroReporte = new Reporte();
            registroReporte.setTipoReporte("PAGOS");
            registroReporte.setFormato("EXCEL");
            registroReporte.setNombreArchivo("reporte-pagos-" + fechaInicio + "-a-" + fechaFin + ".xlsx");
            registroReporte.setGeneradoPor("SISTEMA"); // O podrías obtener el usuario autenticado
            registroReporte.setParametros("FechaInicio: " + fechaInicio + ", FechaFin: " + fechaFin);
            registroReporte.setFechaGeneracion(LocalDateTime.now());
            reporteRepository.save(registroReporte);

            logger.info("Reporte de pagos generado con {} registros", reporte.size());
            return reporte;
        } catch (Exception e) {
            logger.error("Error generando reporte de pagos: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar reporte de pagos: " + e.getMessage());
        }
    }

    private ClienteDto obtenerClienteParaComprobante(ComprobanteDto comprobante, Map<UUID, ClienteDto> clientesMap) {
        // En un escenario real, necesitaríamos obtener el contrato y luego el cliente
        // Por simplicidad, retornamos un cliente genérico
        return clientesMap.values().stream().findFirst()
                .orElse(new ClienteDto(
                        null, "NATURAL", "Cliente", "No Encontrado",
                        "DNI", "00000000", null, null, null, "email@ejemplo.com", "000000000", true
                ));
    }

    private String obtenerNombreCliente(ClienteDto cliente) {
        if ("NATURAL".equals(cliente.tipoCliente())) {
            return cliente.nombre() + " " + cliente.apellido();
        } else {
            return cliente.razonSocial();
        }
    }

    private String obtenerDocumentoCliente(ClienteDto cliente) {
        if ("NATURAL".equals(cliente.tipoCliente())) {
            return cliente.tipoDocumento() + ": " + cliente.numeroDocumento();
        } else {
            return "RUC: " + cliente.ruc();
        }
    }
}
