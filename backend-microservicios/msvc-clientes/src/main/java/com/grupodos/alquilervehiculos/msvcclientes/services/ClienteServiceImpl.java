package com.grupodos.alquilervehiculos.msvcclientes.services;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import com.grupodos.alquilervehiculos.msvcclientes.entities.enums.TipoCliente;
import com.grupodos.alquilervehiculos.msvcclientes.exceptions.RecursoNoEncontradoException;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteEmpresaRepository;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteNaturalRepository;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClienteServiceImpl implements ClienteService {

    private ClienteRepository clienteRepository;
    private ClienteNaturalRepository clienteNaturalRepository;
    private ClienteEmpresaRepository clienteEmpresaRepository;

    public ClienteServiceImpl(ClienteRepository clienteRepository, ClienteNaturalRepository clienteNaturalRepository, ClienteEmpresaRepository clienteEmpresaRepository) {
        this.clienteRepository = clienteRepository;
        this.clienteNaturalRepository = clienteNaturalRepository;
        this.clienteEmpresaRepository = clienteEmpresaRepository;
    }

    @Override
    public List<Cliente> findAll() { return clienteRepository.findAll(); }
    @Override
    public List<Cliente> findAllActivos() { return clienteRepository.findByActivoTrue(); }
    @Override
    public List<Cliente> findAllInactivos() { return clienteRepository.findByActivoFalse(); }
    @Override
    public Cliente findById(UUID id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el cliente con id: " + id));
    }

    @Override
    @Transactional
    public ClienteNatural createNatural(ClienteNaturalDto dto) {
        ClienteNatural cn = new ClienteNatural();
        cn.setNombre(dto.nombre());
        cn.setApellido(dto.apellido());
        cn.setTipoDocumento(dto.tipoDocumento());
        cn.setNumeroDocumento(dto.numeroDocumento());
        cn.setCorreo(dto.correo());
        cn.setTelefono(dto.telefono());
        cn.setDireccion(dto.direccion());
        cn.setTipoCliente(TipoCliente.NATURAL);
        cn.setActivo(true);
        cn.setCreadoEn(OffsetDateTime.now());
        return clienteNaturalRepository.save(cn);
    }

    @Override
    @Transactional
    public ClienteEmpresa createEmpresa(ClienteEmpresaDto dto) {
        ClienteEmpresa ce = new ClienteEmpresa();
        ce.setRazonSocial(dto.razonSocial());
        ce.setRuc(dto.ruc());
        ce.setGiroComercial(dto.giroComercial());
        ce.setDireccionFiscal(dto.direccionFiscal());
        ce.setRepresentante(dto.representante());
        ce.setCorreo(dto.correo());
        ce.setTelefono(dto.telefono());
        ce.setDireccion(dto.direccion());
        ce.setTipoCliente(TipoCliente.EMPRESA);
        ce.setActivo(true);
        ce.setCreadoEn(OffsetDateTime.now());
        return clienteEmpresaRepository.save(ce);
    }

    @Override
    @Transactional
    public ClienteNatural updateNatural(UUID id, ClienteNaturalDto dto) {
        ClienteNatural cn = clienteNaturalRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("ClienteNatural no encontrado: " + id));
        cn.setNombre(dto.nombre());
        cn.setApellido(dto.apellido());
        cn.setTipoDocumento(dto.tipoDocumento());
        cn.setNumeroDocumento(dto.numeroDocumento());
        cn.setCorreo(dto.correo());
        cn.setTelefono(dto.telefono());
        cn.setDireccion(dto.direccion());
        return clienteNaturalRepository.save(cn);
    }

    @Override
    @Transactional
    public ClienteEmpresa updateEmpresa(UUID id, ClienteEmpresaDto dto) {
        ClienteEmpresa ce = clienteEmpresaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("ClienteEmpresa no encontrado con id: " + id));
        ce.setRazonSocial(dto.razonSocial());
        ce.setRuc(dto.ruc());
        ce.setGiroComercial(dto.giroComercial());
        ce.setDireccionFiscal(dto.direccionFiscal());
        ce.setRepresentante(dto.representante());
        ce.setCorreo(dto.correo());
        ce.setTelefono(dto.telefono());
        ce.setDireccion(dto.direccion());
        return clienteEmpresaRepository.save(ce);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));
        c.setActivo(false);
        clienteRepository.save(c);
    }

}
