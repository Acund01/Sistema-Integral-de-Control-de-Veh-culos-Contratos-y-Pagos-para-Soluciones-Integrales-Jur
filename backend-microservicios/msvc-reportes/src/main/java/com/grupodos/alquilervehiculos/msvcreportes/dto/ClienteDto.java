package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.util.UUID;

public record ClienteDto(
        UUID id,
        String tipoCliente,
        String nombre,
        String apellido,
        String tipoDocumento,
        String numeroDocumento,
        String razonSocial,
        String ruc,
        String correo,
        String telefono,
        RepresentanteDto representante
) {}
