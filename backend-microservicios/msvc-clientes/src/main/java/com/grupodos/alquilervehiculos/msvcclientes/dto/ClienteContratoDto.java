package com.grupodos.alquilervehiculos.msvcclientes.dto;

import java.util.UUID;

public record ClienteContratoDto(
        UUID id,
        String tipoCliente,           // NATURAL o EMPRESA
        String nombre,                // ClienteNatural
        String apellido,
        String tipoDocumento,// ClienteNatural
        String numeroDocumento,                    //Natural
        String razonSocial,           // ClienteEmpresa
        String ruc,                   // ClienteEmpresa
        RepresentanteDto representante // Solo para empresas
) {}
