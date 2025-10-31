package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.MantenimientoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Mantenimiento;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.MantenimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mantenimientos")
@Slf4j
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MantenimientoController {
    private final MantenimientoService mantenimientoService;

    @GetMapping
    public ResponseEntity<List<Mantenimiento>> listarTodos() {
        log.debug("Solicitud para listar todos los mantenimientos");
        return ResponseEntity.ok(mantenimientoService.listarTodos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Mantenimiento>> listarActivos() {
        log.debug("Solicitud para listar mantenimientos activos");
        return ResponseEntity.ok(mantenimientoService.listarMantenimientosActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mantenimiento> obtenerPorId(@PathVariable Long id) {
        log.debug("Solicitud para obtener mantenimiento con ID: {}", id);
        return ResponseEntity.ok(mantenimientoService.obtenerPorId(id));
    }

    @GetMapping("/vehiculo/{vehiculoId}")
    public ResponseEntity<List<Mantenimiento>> listarPorVehiculo(@PathVariable UUID vehiculoId) {
        log.debug("Solicitud para listar mantenimientos por vehículo ID: {}", vehiculoId);
        return ResponseEntity.ok(mantenimientoService.listarPorVehiculo(vehiculoId));
    }

    @GetMapping("/vehiculo/{vehiculoId}/activos")
    public ResponseEntity<List<Mantenimiento>> listarMantenimientosActivos(@PathVariable UUID vehiculoId) {
        log.debug("Solicitud para listar mantenimientos activos por vehículo ID: {}", vehiculoId);
        return ResponseEntity.ok(mantenimientoService.listarMantenimientosActivosPorVehiculo(vehiculoId));
    }

    @GetMapping("/vehiculo/{vehiculoId}/historial")
    public ResponseEntity<List<Mantenimiento>> listarHistorial(@PathVariable UUID vehiculoId) {
        log.debug("Solicitud para listar historial de mantenimientos por vehículo ID: {}", vehiculoId);
        return ResponseEntity.ok(mantenimientoService.listarHistorialMantenimientos(vehiculoId));
    }

    @GetMapping("/vehiculo/{vehiculoId}/costo-total")
    public ResponseEntity<BigDecimal> obtenerCostoTotal(@PathVariable UUID vehiculoId) {
        log.debug("Solicitud para obtener costo total de mantenimientos del vehículo: {}", vehiculoId);
        return ResponseEntity.ok(mantenimientoService.obtenerCostoTotalMantenimientos(vehiculoId));
    }

    @GetMapping("/proximos-vencer")
    public ResponseEntity<List<Mantenimiento>> listarProximosAVencer(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaLimite) {
        log.debug("Solicitud para listar mantenimientos próximos a vencer antes de: {}", fechaLimite);
        return ResponseEntity.ok(mantenimientoService.listarMantenimientosProximosAVencer(fechaLimite));
    }

    @PostMapping
    public ResponseEntity<Mantenimiento> crear(@Valid @RequestBody MantenimientoRequestDto dto) {
        log.info("Solicitud para crear mantenimiento");
        return ResponseEntity.status(HttpStatus.CREATED).body(mantenimientoService.crearMantenimiento(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mantenimiento> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MantenimientoRequestDto dto) {
        log.info("Solicitud para actualizar mantenimiento con ID: {}", id);
        return ResponseEntity.ok(mantenimientoService.actualizarMantenimiento(id, dto));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<Mantenimiento> finalizar(@PathVariable Long id) {
        log.info("Solicitud para finalizar mantenimiento con ID: {}", id);
        return ResponseEntity.ok(mantenimientoService.finalizarMantenimiento(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("Solicitud para eliminar mantenimiento con ID: {}", id);
        mantenimientoService.eliminarMantenimiento(id);
        return ResponseEntity.noContent().build();
    }
}
