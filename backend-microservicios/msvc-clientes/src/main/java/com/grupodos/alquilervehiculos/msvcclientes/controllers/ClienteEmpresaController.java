package com.grupodos.alquilervehiculos.msvcclientes.controllers;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaRequestDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/clientes/empresas")
public class ClienteEmpresaController {

    private final ClienteService<ClienteEmpresa, ClienteEmpresaRequestDto> clienteService;

    public ClienteEmpresaController(@Qualifier("clienteEmpresaServiceImpl") ClienteService<ClienteEmpresa, ClienteEmpresaRequestDto> clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<ClienteEmpresa>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteEmpresa> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ClienteEmpresa> crear(@Valid @RequestBody ClienteEmpresaRequestDto dto) {
        ClienteEmpresa nuevo = clienteService.crear(dto);
        return ResponseEntity.ok(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteEmpresa> actualizar(@PathVariable UUID id,
                                                     @Valid @RequestBody ClienteEmpresaRequestDto dto) {
        ClienteEmpresa actualizado = clienteService.actualizar(id, dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
