package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.ModeloRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.ModeloService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modelos")
public class ModeloController {

    private final ModeloService modeloService;

    public ModeloController(ModeloService modeloService) {
        this.modeloService = modeloService;
    }

    @GetMapping
    public List<Modelo> listar() {
        return modeloService.listarTodos();
    }

    @GetMapping("/marca/{idMarca}")
    public List<Modelo> listarPorMarca(@PathVariable Long idMarca) {
        return modeloService.listarPorMarca(idMarca);
    }

    @PostMapping
    public ResponseEntity<Modelo> crear(@RequestBody ModeloRequestDto modelo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(modeloService.crear(modelo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Modelo> actualizar(@RequestBody Long id, ModeloRequestDto modelo) {
        return ResponseEntity.status(HttpStatus.OK).body(modeloService.actualizar(id, modelo));
    }

}
