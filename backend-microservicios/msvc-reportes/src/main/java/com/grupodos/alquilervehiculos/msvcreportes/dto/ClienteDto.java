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
        RepresentanteDto representante,
        String correo,
        String telefono,
        Boolean activo
) {}
