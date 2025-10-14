package com.grupodos.alquilervehiculos.msvcclientes.controllers;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalRequestDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import com.grupodos.alquilervehiculos.msvcclientes.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/clientes/naturales")
public class ClienteNaturalController {

    private final ClienteService<ClienteNatural, ClienteNaturalRequestDto> clienteService;

    public ClienteNaturalController(@Qualifier("clienteNaturalServiceImpl") ClienteService<ClienteNatural, ClienteNaturalRequestDto> clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<ClienteNatural>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteNatural> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ClienteNatural> crear(@Valid @RequestBody ClienteNaturalRequestDto dto) {
        ClienteNatural nuevo = clienteService.crear(dto);
        return ResponseEntity.ok(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteNatural> actualizar(@PathVariable UUID id,
                                                     @Valid @RequestBody ClienteNaturalRequestDto dto) {
        ClienteNatural actualizado = clienteService.actualizar(id, dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}
