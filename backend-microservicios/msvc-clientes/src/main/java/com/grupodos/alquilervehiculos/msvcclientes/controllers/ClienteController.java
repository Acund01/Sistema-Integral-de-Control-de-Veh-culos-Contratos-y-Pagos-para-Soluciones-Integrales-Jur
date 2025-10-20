package com.grupodos.alquilervehiculos.msvcclientes.controllers;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import com.grupodos.alquilervehiculos.msvcclientes.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Listar todos - activos - inactivos - por id
    @GetMapping
    public ResponseEntity<List<Cliente>> getAll() {
        return ResponseEntity.ok(clienteService.findAll());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Cliente>> getActivos() {
        return ResponseEntity.ok(clienteService.findAllActivos());
    }

    @GetMapping("/inactivos")
    public ResponseEntity<List<Cliente>> getInactivos() {
        return ResponseEntity.ok(clienteService.findAllInactivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.findById(id));
    }

    // Cliente natural
    @PostMapping("/naturales")
    public ResponseEntity<ClienteNatural> createNatural(@RequestBody @Valid ClienteNaturalDto dto) {
        return ResponseEntity.ok(clienteService.createNatural(dto));
    }

    @PutMapping("/naturales/{id}")
    public ResponseEntity<ClienteNatural> updateNatural(@PathVariable UUID id,
                                                        @RequestBody @Valid ClienteNaturalDto dto) {
        return ResponseEntity.ok(clienteService.updateNatural(id, dto));
    }

    // Cliente Empresa
    @PostMapping("/empresas")
    public ResponseEntity<ClienteEmpresa> createEmpresa(@RequestBody @Valid ClienteEmpresaDto dto) {
        return ResponseEntity.ok(clienteService.createEmpresa(dto));
    }

    @PutMapping("/empresas/{id}")
    public ResponseEntity<ClienteEmpresa> updateEmpresa(@PathVariable UUID id,
                                                        @RequestBody @Valid ClienteEmpresaDto dto) {
        return ResponseEntity.ok(clienteService.updateEmpresa(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        clienteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
