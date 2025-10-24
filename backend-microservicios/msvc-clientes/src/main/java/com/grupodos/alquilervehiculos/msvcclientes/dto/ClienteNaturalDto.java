package com.grupodos.alquilervehiculos.msvcclientes.dto;

import jakarta.validation.constraints.NotBlank;

public record ClienteNaturalDto(
        @NotBlank
        String nombre,

        @NotBlank
        String apellido,

        @NotBlank
        String tipoDocumento,

        @NotBlank
        String numeroDocumento,

        String correo,
        @NotBlank
        String telefono,
        String direccion
) {}
