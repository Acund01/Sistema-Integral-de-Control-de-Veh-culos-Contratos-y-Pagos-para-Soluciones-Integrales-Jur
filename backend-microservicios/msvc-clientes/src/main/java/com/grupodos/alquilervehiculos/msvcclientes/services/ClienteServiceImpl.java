package com.grupodos.alquilervehiculos.msvcclientes.services;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.grupodos.alquilervehiculos.msvcclientes.dto.*;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Representante;
import com.grupodos.alquilervehiculos.msvcclientes.entities.enums.TipoCliente;
import com.grupodos.alquilervehiculos.msvcclientes.exceptions.RecursoNoEncontradoException;
import com.grupodos.alquilervehiculos.msvcclientes.exceptions.ValidacionException;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteEmpresaRepository;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteNaturalRepository;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.ClienteRepository;
import com.grupodos.alquilervehiculos.msvcclientes.repositories.RepresentanteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteNaturalRepository clienteNaturalRepository;
    private final ClienteEmpresaRepository clienteEmpresaRepository;
    private final RepresentanteRepository representanteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> findAll() {
        log.info("Buscando todos los clientes");
        return ImmutableList.copyOf(clienteRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> findAllActivos() {
        log.info("Buscando clientes activos");
        return ImmutableList.copyOf(clienteRepository.findByActivoTrue());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> findAllInactivos() {
        log.info("Buscando clientes inactivos");
        return ImmutableList.copyOf(clienteRepository.findByActivoFalse());
    }

    @Override
    @Transactional(readOnly = true)
    public Cliente findById(UUID id) {
        Preconditions.checkNotNull(id, "El ID no puede ser nulo");
        log.info("Buscando cliente por ID: {}", id);
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el cliente con id: " + id));
    }

    @Override
    @Transactional
    public ClienteNatural createNatural(ClienteNaturalDto dto) {
        log.info("Creando cliente natural: {} {}", dto.nombre(), dto.apellido());

        if (clienteNaturalRepository.existsByNumeroDocumento(dto.numeroDocumento())) {
            throw new ValidacionException("El número de documento " + dto.numeroDocumento() + " ya está registrado");
        }
        if (StringUtils.isNotBlank(dto.correo()) && clienteRepository.existsByCorreo(dto.correo())) {
            throw new ValidacionException("El correo " + dto.correo() + " ya está registrado");
        }

        ClienteNatural cn = new ClienteNatural();
        cn.setNombre(StringUtils.trim(dto.nombre()));
        cn.setApellido(StringUtils.trim(dto.apellido()));
        cn.setTipoDocumento(dto.tipoDocumento());
        cn.setNumeroDocumento(dto.numeroDocumento());
        cn.setCorreo(StringUtils.trimToNull(dto.correo()));
        cn.setTelefono(StringUtils.trim(dto.telefono()));
        cn.setDireccion(StringUtils.trimToNull(dto.direccion()));
        cn.setTipoCliente(TipoCliente.NATURAL);
        cn.setActivo(true);
        cn.setCreadoEn(OffsetDateTime.now());
        return clienteNaturalRepository.save(cn);
    }

    @Override
    @Transactional
    public ClienteEmpresa createEmpresa(ClienteEmpresaDto dto) {
        log.info("Creando cliente empresa: {}", dto.razonSocial());

        if (clienteEmpresaRepository.existsByRuc(dto.ruc())) {
            throw new ValidacionException("El RUC " + dto.ruc() + " ya está registrado");
        }
        if (StringUtils.isNotBlank(dto.correo()) && clienteRepository.existsByCorreo(dto.correo())) {
            throw new ValidacionException("El correo " + dto.correo() + " ya está registrado");
        }

        ClienteEmpresa ce = new ClienteEmpresa();
        ce.setRazonSocial(StringUtils.trim(dto.razonSocial()));
        ce.setRuc(dto.ruc());
        ce.setGiroComercial(StringUtils.trimToNull(dto.giroComercial()));
        ce.setDireccionFiscal(StringUtils.trimToNull(dto.direccionFiscal()));

        if (dto.representante() != null) {
            Representante representante = crearRepresentante(dto.representante());
            ce.setRepresentante(representante);
        }

        ce.setCorreo(StringUtils.trimToNull(dto.correo()));
        ce.setTelefono(StringUtils.trim(dto.telefono()));
        ce.setDireccion(StringUtils.trimToNull(dto.direccion()));
        ce.setTipoCliente(TipoCliente.EMPRESA);
        ce.setActivo(true);
        ce.setCreadoEn(OffsetDateTime.now());

        return clienteEmpresaRepository.save(ce);
    }

    @Override
    @Transactional
    public ClienteNatural updateNatural(UUID id, ClienteNaturalDto dto) {
        log.info("Actualizando cliente natural ID: {}", id);

        Preconditions.checkNotNull(id, "El ID no puede ser nulo");

        ClienteNatural cn = clienteNaturalRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("ClienteNatural no encontrado: " + id));

        if (!cn.getNumeroDocumento().equals(dto.numeroDocumento())) {
            boolean documentoExistente = clienteNaturalRepository.existsByNumeroDocumentoAndIdNot(dto.numeroDocumento(), id);
            if (documentoExistente) {
                throw new ValidacionException("El número de documento " + dto.numeroDocumento() + " ya está registrado por otro cliente");
            }
        }
        if (!StringUtils.equals(cn.getCorreo(), dto.correo()) && StringUtils.isNotBlank(dto.correo())) {
            boolean correoExistente = clienteRepository.existsByCorreoAndIdNot(dto.correo(), id);
            if (correoExistente) {
                throw new ValidacionException("El correo " + dto.correo() + " ya está registrado por otro cliente");
            }
        }

        cn.setNombre(StringUtils.trim(dto.nombre()));
        cn.setApellido(StringUtils.trim(dto.apellido()));
        cn.setTipoDocumento(dto.tipoDocumento());
        cn.setNumeroDocumento(dto.numeroDocumento());
        cn.setCorreo(StringUtils.trimToNull(dto.correo()));
        cn.setTelefono(StringUtils.trim(dto.telefono()));
        cn.setDireccion(StringUtils.trimToNull(dto.direccion()));
        return clienteNaturalRepository.save(cn);
    }

    @Override
    @Transactional
    public ClienteEmpresa updateEmpresa(UUID id, ClienteEmpresaDto dto) {
        log.info("Actualizando cliente empresa ID: {}", id);

        Preconditions.checkNotNull(id, "El ID no puede ser nulo");

        ClienteEmpresa ce = clienteEmpresaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("ClienteEmpresa no encontrado con id: " + id));

        if (!ce.getRuc().equals(dto.ruc())) {
            boolean rucExistente = clienteEmpresaRepository.existsByRucAndIdNot(dto.ruc(), id);
            if (rucExistente) {
                throw new ValidacionException("El RUC " + dto.ruc() + " ya está registrado por otra empresa");
            }
        }
        if (!StringUtils.equals(ce.getCorreo(), dto.correo()) && StringUtils.isNotBlank(dto.correo())) {
            boolean correoExistente = clienteRepository.existsByCorreoAndIdNot(dto.correo(), id);
            if (correoExistente) {
                throw new ValidacionException("El correo " + dto.correo() + " ya está registrado por otro cliente");
            }
        }

        if (dto.representante() != null) {
            Representante representanteExistente = ce.getRepresentante();

            if (representanteExistente != null) {
                actualizarRepresentante(representanteExistente, dto.representante());
            } else {
                Representante nuevoRepresentante = crearRepresentante(dto.representante());
                ce.setRepresentante(nuevoRepresentante);
            }
        }

        ce.setRazonSocial(StringUtils.trim(dto.razonSocial()));
        ce.setRuc(dto.ruc());
        ce.setGiroComercial(StringUtils.trimToNull(dto.giroComercial()));
        ce.setDireccionFiscal(StringUtils.trimToNull(dto.direccionFiscal()));

        ce.setCorreo(StringUtils.trimToNull(dto.correo()));
        ce.setTelefono(StringUtils.trim(dto.telefono()));
        ce.setDireccion(StringUtils.trimToNull(dto.direccion()));

        return clienteEmpresaRepository.save(ce);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        log.info("Desactivando cliente ID: {}", id);

        Preconditions.checkNotNull(id, "El ID no puede ser nulo");

        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));
        c.setActivo(false);
        clienteRepository.save(c);
    }

    // Feign client service
    @Transactional(readOnly = true)
    public ClienteContratoDto obtenerClienteParaContrato(UUID id) {
        log.info("Obteniendo cliente para contrato ID: {}", id);

        Preconditions.checkNotNull(id, "El ID no puede ser nulo");

        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (c.getTipoCliente() == TipoCliente.NATURAL) {
            ClienteNatural cn = (ClienteNatural) c;
            return new ClienteContratoDto(
                    cn.getId(),
                    "NATURAL",
                    cn.getNombre(),
                    cn.getApellido(),
                    cn.getTipoDocumento(),
                    cn.getNumeroDocumento(),
                    null,
                    null,
                    null
            );
        } else {
            ClienteEmpresa ce = (ClienteEmpresa) c;
            Representante r = ce.getRepresentante();
            RepresentanteDto repDto = new RepresentanteDto(
                    r.getNombre(),
                    r.getApellido(),
                    r.getTipoDocumento(),
                    r.getNumeroDocumento(),
                    r.getCargo(),
                    r.getCorreo(),
                    r.getTelefono()
            );
            return new ClienteContratoDto(
                    ce.getId(),
                    "EMPRESA",
                    null,
                    null,
                    null,
                    null,
                    ce.getRazonSocial(),
                    ce.getRuc(),
                    repDto
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteReporteDto obtenerClienteParaReporte(UUID id) {
        log.info("Obteniendo cliente para reporte ID: {}", id);

        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (c.getTipoCliente() == TipoCliente.NATURAL) {
            ClienteNatural cn = (ClienteNatural) c;
            return new ClienteReporteDto(
                    cn.getId(),
                    "NATURAL",
                    cn.getNombre(),
                    cn.getApellido(),
                    cn.getTipoDocumento(),
                    cn.getNumeroDocumento(),
                    null,
                    null,
                    cn.getCorreo(),
                    cn.getTelefono(),
                    null
            );
        } else {
            ClienteEmpresa ce = (ClienteEmpresa) c;
            Representante r = ce.getRepresentante();
            RepresentanteDto repDto = r != null ? new RepresentanteDto(
                    r.getNombre(),
                    r.getApellido(),
                    r.getTipoDocumento(),
                    r.getNumeroDocumento(),
                    r.getCargo(),
                    r.getCorreo(),
                    r.getTelefono()
            ) : null;

            return new ClienteReporteDto(
                    ce.getId(),
                    "EMPRESA",
                    null,
                    null,
                    null,
                    null,
                    ce.getRazonSocial(),
                    ce.getRuc(),
                    ce.getCorreo(),
                    ce.getTelefono(),
                    repDto
            );
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<ClienteReporteDto> obtenerClientesParaReportes(List<UUID> ids) {
        log.info("Obteniendo {} clientes para reportes por IDs", ids.size());

        return ids.stream()
                .map(id -> {
                    try {
                        return obtenerClienteParaReporte(id);
                    } catch (Exception e) {
                        log.warn("Cliente no encontrado con ID: {}, usando valores por defecto", id);
                        return crearClienteReportePorDefecto(id);
                    }
                })
                .collect(Collectors.toList());
    }

    private ClienteReporteDto crearClienteReportePorDefecto(UUID id) {
        return new ClienteReporteDto(
                id, "NATURAL", "Cliente", "No Encontrado",
                "DNI", "00000000", null, null,
                "no-encontrado@ejemplo.com", "000000000", null
        );
    }

    private void actualizarRepresentante(Representante existente, RepresentanteDto dto) {

        if (!existente.getNumeroDocumento().equals(dto.numeroDocumento())) {
            boolean documentoExistente = representanteRepository.existsByNumeroDocumentoAndIdNot(
                    dto.numeroDocumento(), existente.getId());
            if (documentoExistente) {
                throw new ValidacionException("El documento " + dto.numeroDocumento() + " ya está registrado por otro representante");
            }
        }

        existente.setNombre(StringUtils.trim(dto.nombre()));
        existente.setApellido(StringUtils.trim(dto.apellido()));
        existente.setTipoDocumento(dto.tipoDocumento());
        existente.setNumeroDocumento(dto.numeroDocumento());
        existente.setCargo(StringUtils.trimToNull(dto.cargo()));
        existente.setCorreo(StringUtils.trimToNull(dto.correo()));
        existente.setTelefono(StringUtils.trimToNull(dto.telefono()));

        representanteRepository.save(existente);
    }

    private Representante crearRepresentante(RepresentanteDto dto) {

        if (representanteRepository.existsByNumeroDocumento(dto.numeroDocumento())) {
            throw new ValidacionException("El documento " + dto.numeroDocumento() + " ya está registrado");
        }

        Representante representante = new Representante();
        representante.setNombre(StringUtils.trim(dto.nombre()));
        representante.setApellido(StringUtils.trim(dto.apellido()));
        representante.setTipoDocumento(dto.tipoDocumento());
        representante.setNumeroDocumento(dto.numeroDocumento());
        representante.setCargo(StringUtils.trimToNull(dto.cargo()));
        representante.setCorreo(StringUtils.trimToNull(dto.correo()));
        representante.setTelefono(StringUtils.trimToNull(dto.telefono()));

        return representanteRepository.save(representante);
    }
}
