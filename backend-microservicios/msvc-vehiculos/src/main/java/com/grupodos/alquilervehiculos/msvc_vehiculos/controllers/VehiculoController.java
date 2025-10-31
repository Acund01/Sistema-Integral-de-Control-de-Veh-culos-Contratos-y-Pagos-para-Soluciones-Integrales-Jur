package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.CambioEstadoRequest;
import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.VehiculoContratoDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.VehiculoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.VehiculoResponseDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.EstadoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.VehiculoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehiculos")
@Slf4j
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VehiculoController {

    private final VehiculoService vehiculoService;

    @GetMapping
    public ResponseEntity<List<Vehiculo>> listarTodos() {
        log.debug("Solicitud para listar todos los vehículos");
        return ResponseEntity.ok(vehiculoService.listarTodos());
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Vehiculo>> listarDisponibles() {
        log.debug("Solicitud para listar vehículos disponibles");
        return ResponseEntity.ok(vehiculoService.listarDisponibles());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Vehiculo>> listarPorEstado(@PathVariable EstadoVehiculo estado) {
        log.debug("Solicitud para listar vehículos por estado: {}", estado);
        return ResponseEntity.ok(vehiculoService.listarPorEstado(estado));
    }

    @GetMapping("/marca/{marcaId}")
    public ResponseEntity<List<Vehiculo>> listarPorMarca(@PathVariable Long marcaId) {
        log.debug("Solicitud para listar vehículos por marca ID: {}", marcaId);
        return ResponseEntity.ok(vehiculoService.listarPorMarca(marcaId));
    }

    @GetMapping("/tipo/{tipoId}")
    public ResponseEntity<List<Vehiculo>> listarPorTipo(@PathVariable Long tipoId) {
        log.debug("Solicitud para listar vehículos por tipo ID: {}", tipoId);
        return ResponseEntity.ok(vehiculoService.listarPorTipo(tipoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehiculo> obtenerPorId(@PathVariable UUID id) {
        log.debug("Solicitud para obtener vehículo con ID: {}", id);
        return ResponseEntity.ok(vehiculoService.obtenerPorId(id));
    }

    @GetMapping("/{id}/disponible")
    public ResponseEntity<Boolean> verificarDisponibilidad(@PathVariable UUID id) {
        log.debug("Solicitud para verificar disponibilidad del vehículo: {}", id);
        return ResponseEntity.ok(vehiculoService.verificarDisponibilidad(id));
    }

    @PostMapping
    public ResponseEntity<Vehiculo> crear(@Valid @RequestBody VehiculoRequestDto vehiculo) {
        log.info("Solicitud para crear vehículo");
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.crearVehiculo(vehiculo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehiculo> actualizar(@PathVariable UUID id, @Valid @RequestBody VehiculoRequestDto vehiculo) {
        log.info("Solicitud para actualizar vehículo con ID: {}", id);
        return ResponseEntity.ok(vehiculoService.actualizarVehiculo(id, vehiculo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        log.info("Solicitud para eliminar vehículo con ID: {}", id);
        vehiculoService.eliminarVehiculo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contratos/{id}")
    public ResponseEntity<VehiculoContratoDto> obtenerParaContrato(@PathVariable UUID id) {
        log.debug("Solicitud para obtener vehículo para contrato con ID: {}", id);
        Vehiculo v = vehiculoService.obtenerPorId(id);
        VehiculoContratoDto dto = new VehiculoContratoDto(
                v.getId(),
                v.getPlaca(),
                v.getModelo().getMarca().getNombre(),
                v.getModelo().getNombre(),
                v.getTipoVehiculo().getNombre(),
                v.getEstado().name()
        );
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Vehiculo> actualizarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody CambioEstadoRequest request) {
        log.info("Solicitud para actualizar estado del vehículo {} a: {}", id, request.estado());
        Vehiculo vehiculo = vehiculoService.actualizarEstado(id, request.estado());
        return ResponseEntity.ok(vehiculo);
    }

    @GetMapping("/para-reportes")
    public ResponseEntity<List<VehiculoResponseDto>> listarParaReportes() {
        log.debug("Solicitud para listar vehículos para reportes");
        return ResponseEntity.ok(vehiculoService.listarTodosParaReportes());
    }
}
