package com.grupodos.alquilervehiculos.msvc_contratos.controllers;

import com.grupodos.alquilervehiculos.msvc_contratos.dto.ContratoRequestDto;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.ContratoResponseDto;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.RangoFechasRequest;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.Contrato;
import com.grupodos.alquilervehiculos.msvc_contratos.services.ContratoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/contratos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ContratoController {

    private final ContratoService  contratoService;

    public ContratoController(ContratoService contratoService) {
        this.contratoService = contratoService;
    }

    @GetMapping
    public ResponseEntity<List<ContratoResponseDto>> listarContratos() {
        return ResponseEntity.ok(contratoService.listarContratos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratoResponseDto> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(contratoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ContratoResponseDto> crearContrato(@Valid @RequestBody ContratoRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contratoService.crearContrato(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratoResponseDto> actualizarContrato(
            @PathVariable UUID id,
            @Valid @RequestBody ContratoRequestDto dto) {
        return ResponseEntity.ok(contratoService.actualizarContrato(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarContrato(@PathVariable UUID id) {
        contratoService.eliminarContrato(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<ContratoResponseDto> finalizarContrato(@PathVariable UUID id) {
        return ResponseEntity.ok(contratoService.finalizarContrato(id));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<ContratoResponseDto> cancelarContrato(@PathVariable UUID id) {
        return ResponseEntity.ok(contratoService.cancelarContrato(id));
    }

    @PostMapping("/rango-fechas")
    public ResponseEntity<List<ContratoResponseDto>> obtenerContratosPorRangoFechas(
            @Valid @RequestBody RangoFechasRequest request) {

        List<ContratoResponseDto> contratos = contratoService
                .obtenerContratosPorRangoFechas(request.fechaInicio(), request.fechaFin());

        return ResponseEntity.ok(contratos);
    }
}
