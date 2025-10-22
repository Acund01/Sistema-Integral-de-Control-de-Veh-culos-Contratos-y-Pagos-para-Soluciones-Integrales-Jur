package com.grupodos.alquilervehiculos.msvcclientes.dto;

public record RepresentanteDto(
        String nombre,
        String apellido,
        String tipoDocumento,
        String numeroDocumento,
        String cargo,
        String correo,
        String telefono
) {}
