package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.TipoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.TipoVehiculoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-vehiculo")
@Slf4j
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TipoVehiculoController {

    private final TipoVehiculoService tipoVehiculoService;

    @GetMapping
    public ResponseEntity<List<TipoVehiculo>> listarTodos() {
        log.debug("Solicitud para listar todos los tipos de vehículo");
        return ResponseEntity.ok(tipoVehiculoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoVehiculo> obtenerPorId(@PathVariable Long id) {
        log.debug("Solicitud para obtener tipo de vehículo con ID: {}", id);
        return ResponseEntity.ok(tipoVehiculoService.obtenerPorId(id));
    }
}
