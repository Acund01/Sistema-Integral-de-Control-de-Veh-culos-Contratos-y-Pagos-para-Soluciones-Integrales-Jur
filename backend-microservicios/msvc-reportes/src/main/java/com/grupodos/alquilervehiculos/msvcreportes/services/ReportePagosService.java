package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.clients.ClienteFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.clients.ContratoFeignClient;
import com.grupodos.alquilervehiculos.msvcreportes.dto.*;
import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import com.grupodos.alquilervehiculos.msvcreportes.repositories.ReporteRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Slf4j
@AllArgsConstructor
public class ReportePagosService {

    private final ContratoFeignClient contratoClient;
    private final ClienteFeignClient clienteClient;
    private final ReporteRepository reporteRepository;

    public List<ReportePagosDto> generarReportePagos(LocalDate fechaInicio, LocalDate fechaFin) {
        log.info("Generando reporte de pagos desde {} hasta {}", fechaInicio, fechaFin);

        try {
            RangoFechasRequest request = new RangoFechasRequest(fechaInicio, fechaFin);

            List<ComprobanteDto> comprobantes = contratoClient.obtenerComprobantesPorRangoFechas(request);
            log.debug("Comprobantes obtenidos: {}", comprobantes != null ? comprobantes.size() : "NULL");

            if (comprobantes == null || comprobantes.isEmpty()) {
                log.warn("No se encontraron comprobantes para el rango indicado");
                return Collections.emptyList();
            }

            List<ContratoPagoDto> contratos = contratoClient.obtenerContratosPorRangoFechasPago(request);
            log.info("Contratos recibidos: {}", contratos);

            Set<UUID> clienteIds = contratos.stream()
                    .filter(c -> c.cliente() != null && c.cliente().id() != null)
                    .map(c -> c.cliente().id())
                    .collect(Collectors.toSet());

            log.debug("Clientes a consultar ({}): {}", clienteIds.size(), clienteIds);

            List<ClienteDto> clientes = clienteIds.isEmpty()
                    ? new ArrayList<>()
                    : clienteClient.obtenerClientesParaReportes(new ArrayList<>(clienteIds));

            log.info("Clientes recibidos: {}", clientes);

            Map<UUID, ContratoPagoDto> contratoMap = contratos.stream()
                    .filter(c -> c.id() != null)
                    .collect(Collectors.toMap(ContratoPagoDto::id, c -> c));

            Map<UUID, ClienteDto> clienteMap = clientes.stream()
                    .filter(c -> c.id() != null)
                    .collect(Collectors.toMap(ClienteDto::id, c -> c));

            List<ReportePagosDto> reporte = new ArrayList<>();

            for (ComprobanteDto comprobante : comprobantes) {
                if (comprobante == null || comprobante.idContrato() == null) continue;

                ContratoPagoDto contrato = contratoMap.get(comprobante.idContrato());
                ClienteDto cliente = null;

                if (contrato != null && contrato.cliente() != null) {
                    cliente = clienteMap.getOrDefault(contrato.cliente().id(), contrato.cliente());
                }

                if (cliente == null) {
                    log.warn("Cliente no encontrado para contrato {} (clienteId=null)", comprobante.idContrato());
                    cliente = crearClientePorDefecto();
                }

                String codigoContrato = contrato != null ? contrato.codigoContrato() : "N/A";

                reporte.add(new ReportePagosDto(
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
                ));
            }

            //Guardar registro del reporte
            guardarRegistroReporte(fechaInicio, fechaFin, reporte.size());

            log.info("Reporte generado con {} registros", reporte.size());
            return reporte;

        } catch (Exception e) {
            log.error("Error generando reporte de pagos: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar reporte de pagos: " + e.getMessage(), e);
        }
    }

    // Cliente por defecto en caso de error o nulo
    private ClienteDto crearClientePorDefecto() {
        return new ClienteDto(
                UUID.randomUUID(),
                "NATURAL",
                "Cliente",
                "No Encontrado",
                "DNI",
                "00000000",
                null,
                null,
                "no-encontrado@ejemplo.com",
                "000000000",
                null
        );
    }

    // Obtener nombre completo o razón social
    private String obtenerNombreCliente(ClienteDto cliente) {
        if ("NATURAL".equalsIgnoreCase(cliente.tipoCliente())) {
            return (cliente.nombre() != null ? cliente.nombre() : "") + " " +
                    (cliente.apellido() != null ? cliente.apellido() : "");
        } else {
            return cliente.razonSocial() != null ? cliente.razonSocial() : "Cliente Empresa";
        }
    }

    // Obtener documento del cliente
    private String obtenerDocumentoCliente(ClienteDto cliente) {
        if ("NATURAL".equalsIgnoreCase(cliente.tipoCliente())) {
            return cliente.tipoDocumento() + ": " + cliente.numeroDocumento();
        } else {
            return "RUC: " + (cliente.ruc() != null ? cliente.ruc() : "00000000000");
        }
    }

    // Registrar auditoría del reporte
    private void guardarRegistroReporte(LocalDate fechaInicio, LocalDate fechaFin, int cantidadRegistros) {
        Reporte registro = new Reporte();
        registro.setTipoReporte("PAGOS");
        registro.setFormato("EXCEL");
        registro.setNombreArchivo("reporte-pagos-" + fechaInicio + "-a-" + fechaFin + ".xlsx");
        registro.setGeneradoPor("SISTEMA");
        registro.setParametros("FechaInicio: " + fechaInicio + ", FechaFin: " + fechaFin + ", Registros: " + cantidadRegistros);
        registro.setFechaGeneracion(LocalDateTime.now());
        reporteRepository.save(registro);
    }
}