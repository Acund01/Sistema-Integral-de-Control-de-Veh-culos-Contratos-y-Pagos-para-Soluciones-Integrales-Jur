package com.grupodos.alquilervehiculos.msvcclientes.services;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaRequestDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.exceptions.ResourceNotFoundException;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteEmpresaRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClienteEmpresaServiceImpl implements ClienteService<ClienteEmpresa, ClienteEmpresaRequestDto>{

    private final ClienteEmpresaRepository clienteEmpresaRepository;

    public ClienteEmpresaServiceImpl(ClienteEmpresaRepository clienteEmpresaRepository) {
        this.clienteEmpresaRepository = clienteEmpresaRepository;
    }

    @Override
    public List<ClienteEmpresa> listarTodos() {
        return clienteEmpresaRepository.findByActivoTrue();
    }

    @Override
    public ClienteEmpresa obtenerPorId(UUID id) {
        return clienteEmpresaRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente empresa no encontrado"));
    }

    @Override
    public ClienteEmpresa crear(ClienteEmpresaRequestDto dto) {
        ClienteEmpresa cliente = new ClienteEmpresa();
        cliente.setRazonSocial(dto.razonSocial());
        cliente.setRuc(dto.ruc());
        cliente.setCorreo(dto.correo());
        cliente.setTelefono(dto.telefono());
        cliente.setDireccion(dto.direccion());
        cliente.setActivo(true);
        cliente.setCreadoEn(OffsetDateTime.now());
        return clienteEmpresaRepository.save(cliente);
    }

    @Override
    public ClienteEmpresa actualizar(UUID id, ClienteEmpresaRequestDto dto) {
        ClienteEmpresa existente = obtenerPorId(id);
        existente.setRazonSocial(dto.razonSocial());
        existente.setRuc(dto.ruc());
        existente.setCorreo(dto.correo());
        existente.setTelefono(dto.telefono());
        existente.setDireccion(dto.direccion());
        return clienteEmpresaRepository.save(existente);
    }

    @Override
    public void eliminar(UUID id) {
        ClienteEmpresa cliente = obtenerPorId(id);
        cliente.setActivo(false);
        clienteEmpresaRepository.save(cliente);
    }

}
