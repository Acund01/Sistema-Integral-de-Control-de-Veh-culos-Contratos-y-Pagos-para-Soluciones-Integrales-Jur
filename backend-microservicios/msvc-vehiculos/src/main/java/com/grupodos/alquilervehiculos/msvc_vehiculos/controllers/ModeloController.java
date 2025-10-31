package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.ModeloRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.ModeloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modelos")
@Slf4j
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ModeloController {

    private final ModeloService modeloService;

    @GetMapping
    public ResponseEntity<List<Modelo>> listarTodos() {
        log.debug("Solicitud para listar todos los modelos");
        return ResponseEntity.ok(modeloService.listarTodos());
    }

    @GetMapping("/marca/{marcaId}")
    public ResponseEntity<List<Modelo>> listarPorMarca(@PathVariable Long marcaId) {
        log.debug("Solicitud para listar modelos por marca ID: {}", marcaId);
        return ResponseEntity.ok(modeloService.listarPorMarca(marcaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modelo> obtenerPorId(@PathVariable Long id) {
        log.debug("Solicitud para obtener modelo con ID: {}", id);
        return ResponseEntity.ok(modeloService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Modelo> crear(@Valid @RequestBody ModeloRequestDto modelo) {
        log.info("Solicitud para crear modelo");
        return ResponseEntity.status(HttpStatus.CREATED).body(modeloService.crearModelo(modelo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Modelo> actualizar(@PathVariable Long id, @Valid @RequestBody ModeloRequestDto modelo) {
        log.info("Solicitud para actualizar modelo con ID: {}", id);
        return ResponseEntity.ok(modeloService.actualizarModelo(id, modelo));
    }
}
