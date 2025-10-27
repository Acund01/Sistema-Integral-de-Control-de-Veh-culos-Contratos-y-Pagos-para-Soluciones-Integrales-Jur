package com.grupodos.alquilervehiculos.msvcclientes.services;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteContratoDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteReporteDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;

import java.util.List;
import java.util.UUID;

public interface ClienteService {

    List<Cliente> findAll();
    List<Cliente> findAllActivos();
    List<Cliente> findAllInactivos();
    Cliente findById(UUID id);
    ClienteNatural createNatural(ClienteNaturalDto dto);
    ClienteEmpresa createEmpresa(ClienteEmpresaDto dto);
    ClienteNatural updateNatural(UUID id, ClienteNaturalDto dto);
    ClienteEmpresa updateEmpresa(UUID id, ClienteEmpresaDto dto);
    void delete(UUID id);

    ClienteContratoDto obtenerClienteParaContrato(UUID id);
    ClienteReporteDto obtenerClienteParaReporte(UUID id);
    List<ClienteReporteDto> obtenerClientesParaReportes(List<UUID> ids);
}
