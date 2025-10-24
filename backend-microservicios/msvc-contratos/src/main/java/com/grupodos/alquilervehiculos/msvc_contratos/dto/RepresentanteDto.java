package com.grupodos.alquilervehiculos.msvc_contratos.dto;

public record RepresentanteDto(
        String nombre,
        String apellido,
        String tipoDocumento,
        String numeroDocumento,
        String cargo,
        String correo,
        String telefono
) {}
