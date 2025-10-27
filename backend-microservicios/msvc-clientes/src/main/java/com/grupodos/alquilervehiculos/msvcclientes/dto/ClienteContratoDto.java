package com.grupodos.alquilervehiculos.msvcclientes.dto;

import java.util.UUID;

public record ClienteContratoDto(
        UUID id,
        String tipoCliente,
        String nombre,
        String apellido,
        String tipoDocumento,
        String numeroDocumento,
        String razonSocial,
        String ruc,
        RepresentanteDto representante
) {}
