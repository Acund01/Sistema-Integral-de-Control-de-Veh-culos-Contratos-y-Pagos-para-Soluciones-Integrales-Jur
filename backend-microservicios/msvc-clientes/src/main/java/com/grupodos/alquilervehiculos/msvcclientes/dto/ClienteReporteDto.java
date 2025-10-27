package com.grupodos.alquilervehiculos.msvcclientes.dto;

import java.util.UUID;

public record ClienteReporteDto(
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
