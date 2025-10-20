package com.grupodos.alquilervehiculos.msvcclientes.services;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalRequestDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import com.grupodos.alquilervehiculos.msvcclientes.exceptions.ResourceNotFoundException;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteNaturalRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClienteNaturalServiceImpl implements ClienteService<ClienteNatural, ClienteNaturalRequestDto>{

    private final ClienteNaturalRepository  clienteNaturalRepository;

    public ClienteNaturalServiceImpl(ClienteNaturalRepository clienteNaturalRepository) {
        this.clienteNaturalRepository = clienteNaturalRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteNatural> listarTodos() {
        return clienteNaturalRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public ClienteNatural obtenerPorId(UUID id) {
        return clienteNaturalRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente natural no encontrado con id: " + id));
    }

    @Transactional
    public ClienteNatural crear(ClienteNaturalRequestDto dto) {
        ClienteNatural cliente = new ClienteNatural();
        cliente.setNombre(dto.nombre());
        cliente.setApellido(dto.apellido());
        cliente.setDni(dto.dni());
        cliente.setCorreo(dto.correo());
        cliente.setTelefono(dto.telefono());
        cliente.setDireccion(dto.direccion());
        cliente.setActivo(true); // activo por defecto al crear
        cliente.setCreadoEn(OffsetDateTime.now());
        return clienteNaturalRepository.save(cliente);
    }

    @Transactional
    public ClienteNatural actualizar(UUID id, ClienteNaturalRequestDto dto) {
        ClienteNatural existente = obtenerPorId(id);
        existente.setNombre(dto.nombre());
        existente.setApellido(dto.apellido());
        existente.setDni(dto.dni());
        existente.setCorreo(dto.correo());
        existente.setTelefono(dto.telefono());
        existente.setDireccion(dto.direccion());
        return clienteNaturalRepository.save(existente);
    }

    @Transactional
    public void eliminar(UUID id) {
        ClienteNatural cliente = obtenerPorId(id);
        cliente.setActivo(false);
        clienteNaturalRepository.save(cliente);
    }

}
