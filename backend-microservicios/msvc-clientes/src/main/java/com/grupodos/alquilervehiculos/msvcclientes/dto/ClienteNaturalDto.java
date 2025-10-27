package com.grupodos.alquilervehiculos.msvcclientes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteNaturalDto(
        @NotBlank
        @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
        String nombre,

        @NotBlank
        @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
        String apellido,

        @NotBlank
        String tipoDocumento,

        @NotBlank
        @Size(min = 8, message = "El documento debe tener minimo 8 caracteres")
        String numeroDocumento,

        @Email(message = "El correo debe tener un formato válido")
        String correo,

        @NotBlank
        @Size(min = 9, max = 15, message = "El teléfono debe tener entre 9 y 15 dígitos")
        @Pattern(regexp = "^[0-9+\\-\\s()]+$", message = "El teléfono solo puede contener números, +, -, espacios y paréntesis")
        String telefono,

        @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
        String direccion
) {}
