package com.grupodos.alquilervehiculos.msvcclientes.controllers;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteContratoDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteReporteDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import com.grupodos.alquilervehiculos.msvcclientes.services.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/clientes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ClienteController {

    private final ClienteService clienteService;

    // Listar todos - activos - inactivos - por id
    @GetMapping
    public ResponseEntity<List<Cliente>> getAll() {
        log.info("GET /api/clientes - Listar todos");
        return ResponseEntity.ok(clienteService.findAll());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Cliente>> getActivos() {
        log.info("GET /api/clientes/activos - Listar activos");
        return ResponseEntity.ok(clienteService.findAllActivos());
    }

    @GetMapping("/inactivos")
    public ResponseEntity<List<Cliente>> getInactivos() {
        log.info("GET /api/clientes/inactivos - Listar inactivos");
        return ResponseEntity.ok(clienteService.findAllInactivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getById(@PathVariable UUID id) {
        log.info("GET /api/clientes/{} - Buscar por ID", id);
        return ResponseEntity.ok(clienteService.findById(id));
    }

    // Cliente natural
    @PostMapping("/naturales")
    public ResponseEntity<ClienteNatural> createNatural(@RequestBody @Valid ClienteNaturalDto dto) {
        log.info("POST /api/clientes/naturales - Crear natural: {}", dto.nombre());
        return ResponseEntity.ok(clienteService.createNatural(dto));
    }

    @PutMapping("/naturales/{id}")
    public ResponseEntity<ClienteNatural> updateNatural(@PathVariable UUID id,
                                                        @RequestBody @Valid ClienteNaturalDto dto) {
        log.info("PUT /api/clientes/naturales/{} - Actualizar natural", id);
        return ResponseEntity.ok(clienteService.updateNatural(id, dto));
    }

    // Cliente Empresa
    @PostMapping("/empresas")
    public ResponseEntity<ClienteEmpresa> createEmpresa(@RequestBody @Valid ClienteEmpresaDto dto) {
        log.info("POST /api/clientes/empresas - Crear empresa: {}", dto.razonSocial());
        return ResponseEntity.ok(clienteService.createEmpresa(dto));
    }

    @PutMapping("/empresas/{id}")
    public ResponseEntity<ClienteEmpresa> updateEmpresa(@PathVariable UUID id,
                                                        @RequestBody @Valid ClienteEmpresaDto dto) {
        log.info("PUT /api/clientes/empresas/{} - Actualizar empresa", id);
        return ResponseEntity.ok(clienteService.updateEmpresa(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("DELETE /api/clientes/{} - Desactivar cliente", id);
        clienteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    //Feign client contratos
    @GetMapping("/contratos/{id}")
    public ResponseEntity<ClienteContratoDto> obtenerParaContrato(@PathVariable UUID id) {
        log.info("GET /api/clientes/contratos/{} - Obtener para contrato", id);
        ClienteContratoDto dto = clienteService.obtenerClienteParaContrato(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/reportes/por-ids")
    public ResponseEntity<List<ClienteReporteDto>> obtenerClientesParaReportes(@RequestBody List<UUID> ids) {
        log.info("POST /api/clientes/reportes/por-ids - Obtener {} clientes para reportes", ids.size());

        List<ClienteReporteDto> clientes = clienteService.obtenerClientesParaReportes(ids);
        return ResponseEntity.ok(clientes);
    }
}
