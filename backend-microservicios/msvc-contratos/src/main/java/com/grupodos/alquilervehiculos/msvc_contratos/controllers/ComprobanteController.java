package com.grupodos.alquilervehiculos.msvc_contratos.controllers;

import com.grupodos.alquilervehiculos.msvc_contratos.dto.ComprobanteRequestDto;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.ComprobanteResponseDto;
import com.grupodos.alquilervehiculos.msvc_contratos.services.ComprobanteService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/comprobantes")
@CrossOrigin(origins = "http://localhost:3000")
public class ComprobanteController {

    private final ComprobanteService comprobanteService;

    public ComprobanteController(ComprobanteService comprobanteService) {
        this.comprobanteService = comprobanteService;
    }

    // SOLO ESTE ENDPOINT PARA GENERAR
    @PostMapping
    public ResponseEntity<ComprobanteResponseDto> generarComprobante(@RequestBody ComprobanteRequestDto dto) {
        return ResponseEntity.ok(comprobanteService.generarComprobante(dto));
    }

    @GetMapping("/contrato/{contratoId}")
    public ResponseEntity<ComprobanteResponseDto> obtenerPorContrato(@PathVariable UUID contratoId) {
        return ResponseEntity.ok(comprobanteService.obtenerPorContrato(contratoId));
    }

    @GetMapping("/{comprobanteId}/descargar")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable UUID comprobanteId) {
        byte[] pdfBytes = comprobanteService.descargarPdf(comprobanteId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"comprobante-" + comprobanteId + ".pdf\"")
                .body(pdfBytes);
    }

    @PutMapping("/{comprobanteId}/anular")
    public ResponseEntity<Void> anularComprobante(@PathVariable UUID comprobanteId) {
        comprobanteService.anularComprobante(comprobanteId);
        return ResponseEntity.ok().build();
    }
}