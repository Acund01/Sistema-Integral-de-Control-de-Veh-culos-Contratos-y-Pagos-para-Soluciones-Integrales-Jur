package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.MarcaConModelosRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Marca;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.MarcaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
@Slf4j
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MarcaController {

    private final MarcaService marcaService;

    @GetMapping
    public ResponseEntity<List<Marca>> listarTodas() {
        log.debug("Solicitud para listar todas las marcas");
        return ResponseEntity.ok(marcaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Marca> obtenerPorId(@PathVariable Long id) {
        log.debug("Solicitud para obtener marca con ID: {}", id);
        return ResponseEntity.ok(marcaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Marca> crear(@RequestParam String nombre) {
        log.info("Solicitud para crear marca: {}", nombre);
        return ResponseEntity.status(HttpStatus.CREATED).body(marcaService.crearMarca(nombre));
    }

    @PostMapping("/con-modelos")
    public ResponseEntity<Marca> crearConModelos(@Valid @RequestBody MarcaConModelosRequestDto dto) {
        log.info("Solicitud para crear marca con modelos: {}", dto.nombreMarca());
        Marca marca = marcaService.crearMarcaConModelos(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(marca);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Marca> actualizar(@PathVariable Long id, @RequestParam String nombre) {
        log.info("Solicitud para actualizar marca ID: {} a: {}", id, nombre);
        return ResponseEntity.ok(marcaService.actualizarMarca(id, nombre));
    }
}
