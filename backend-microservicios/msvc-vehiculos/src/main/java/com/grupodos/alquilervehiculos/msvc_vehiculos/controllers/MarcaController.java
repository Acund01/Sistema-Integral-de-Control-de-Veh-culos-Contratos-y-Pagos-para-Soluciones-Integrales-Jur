package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Marca;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.MarcaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) { this.marcaService = marcaService; }

    @GetMapping
    public List<Marca> listar() {
        return marcaService.listar();
    }

    @GetMapping("/{id}")
    public Marca obtenerPorId(@PathVariable Long id) {
        return marcaService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Marca> crear(@RequestBody Marca marca) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marcaService.crear(marca));
    }

    @PutMapping("/{id}")
    public Marca actualizar(@PathVariable Long id, @RequestBody Marca marca) {
        return marcaService.actualizar(id, marca);
    }
}
