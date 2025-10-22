package com.grupodos.alquilervehiculos.msvc_contratos.services;

import com.grupodos.alquilervehiculos.msvc_contratos.dto.ComprobanteRequestDto;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.ComprobanteResponseDto;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.Comprobante;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.Contrato;
import com.grupodos.alquilervehiculos.msvc_contratos.repositories.ComprobanteRepository;
import com.grupodos.alquilervehiculos.msvc_contratos.repositories.ContratoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class ComprobanteService {

    private final ComprobanteRepository comprobanteRepository;
    private final ContratoRepository contratoRepository;
    private final PdfGeneratorService pdfGeneratorService;

    public ComprobanteService(ComprobanteRepository comprobanteRepository,
                              ContratoRepository contratoRepository,
                              PdfGeneratorService pdfGeneratorService) {
        this.comprobanteRepository = comprobanteRepository;
        this.contratoRepository = contratoRepository;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @Transactional
    public ComprobanteResponseDto generarComprobante(ComprobanteRequestDto dto) {
        // Validar contrato
        Contrato contrato = contratoRepository.findById(dto.idContrato())
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado"));

        if (!"FINALIZADO".equals(contrato.getEstado())) {
            throw new RuntimeException("Solo se pueden generar comprobantes para contratos finalizados");
        }

        // Validar que no exista comprobante
        if (comprobanteRepository.findByContratoId(dto.idContrato()).isPresent()) {
            throw new RuntimeException("Ya existe un comprobante para este contrato");
        }

        // Generar numeración AUTOMÁTICA
        String serie = determinarSerie(dto.tipoComprobante());
        String correlativo = generarNumeroCorrelativo(serie);

        // Calcular montos
        BigDecimal subtotal = BigDecimal.valueOf(contrato.getMontoTotal());
        BigDecimal igv = subtotal.multiply(new BigDecimal("0.18"));
        BigDecimal total = subtotal.add(igv);

        // Crear comprobante
        Comprobante comprobante = new Comprobante(
                contrato,
                dto.tipoComprobante(),
                serie,
                correlativo,
                subtotal,
                igv,
                total
        );

        comprobanteRepository.save(comprobante);
        return mapToResponse(comprobante);
    }

    private String determinarSerie(String tipoComprobante) {
        return "BOLETA".equals(tipoComprobante) ? "B001" : "F001";
    }

    private String generarNumeroCorrelativo(String serie) {
        String ultimoCorrelativo = comprobanteRepository.findMaxCorrelativoBySerie(serie);
        if (ultimoCorrelativo == null) {
            return "000001";
        }
        int siguiente = Integer.parseInt(ultimoCorrelativo) + 1;
        return String.format("%06d", siguiente);
    }

    // Los demás métodos se mantienen igual...
    public ComprobanteResponseDto obtenerPorContrato(UUID contratoId) {
        Comprobante comprobante = comprobanteRepository.findByContratoId(contratoId)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));
        return mapToResponse(comprobante);
    }

    public byte[] descargarPdf(UUID comprobanteId) {
        Comprobante comprobante = comprobanteRepository.findById(comprobanteId)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));
        return pdfGeneratorService.generarComprobantePdf(comprobante);
    }

    @Transactional
    public void anularComprobante(UUID comprobanteId) {
        Comprobante comprobante = comprobanteRepository.findById(comprobanteId)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));
        comprobante.setEstado("ANULADO");
        comprobanteRepository.save(comprobante);
    }

    private ComprobanteResponseDto mapToResponse(Comprobante comprobante) {
        return new ComprobanteResponseDto(
                comprobante.getId(),
                comprobante.getContrato().getId(),
                comprobante.getFechaEmision(),
                comprobante.getTipoComprobante(),
                comprobante.getNumeroSerie(),
                comprobante.getNumeroCorrelativo(),
                comprobante.getSubtotal(),
                comprobante.getIgv(),
                comprobante.getTotal(),
                comprobante.getEstado()
        );
    }
}
