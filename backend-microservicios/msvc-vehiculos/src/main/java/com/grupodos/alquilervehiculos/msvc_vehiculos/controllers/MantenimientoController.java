package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.MantenimientoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Mantenimiento;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.MantenimientoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mantenimientos")
public class MantenimientoController {
    private final MantenimientoService mantenimientoService;

    public MantenimientoController(MantenimientoService mantenimientoService) {
        this.mantenimientoService = mantenimientoService;
    }

    // Listar todos los mantenimientos
    @GetMapping
    public List<Mantenimiento> listar() {
        return mantenimientoService.listarTodos();
    }

    // Obtener mantenimiento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Mantenimiento> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(mantenimientoService.obtenerPorId(id));
    }

    // Listar mantenimientos por vehículo
    @GetMapping("/vehiculo/{vehiculoId}")
    public List<Mantenimiento> listarPorVehiculo(@PathVariable UUID vehiculoId) {
        return mantenimientoService.listarPorVehiculo(vehiculoId);
    }

    // Crear mantenimiento (cambia estado a MANTENIMIENTO)
    @PostMapping
    public ResponseEntity<Mantenimiento> crear(@RequestBody MantenimientoRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mantenimientoService.crearMantenimiento(dto));
    }

    // Finalizar mantenimiento (cambia estado a DISPONIBLE)
    @PutMapping("/{id}/finalizar")
    public Mantenimiento finalizar(@PathVariable Long id) {
        return mantenimientoService.finalizarMantenimiento(id);
    }

    // Eliminar mantenimiento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mantenimientoService.eliminarMantenimiento(id);
        return ResponseEntity.noContent().build();
    }

}
