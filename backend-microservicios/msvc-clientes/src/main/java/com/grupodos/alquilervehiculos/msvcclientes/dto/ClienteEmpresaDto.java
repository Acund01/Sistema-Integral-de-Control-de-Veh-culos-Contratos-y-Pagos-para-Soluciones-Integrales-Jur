package com.grupodos.alquilervehiculos.msvcclientes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteEmpresaDto(
        @NotBlank
        @Size(min = 3, max = 100, message = "La razon social debe tener entre 3 y 100 caracteres")
        String razonSocial,

        @NotBlank
        @Size(min = 11, max = 11, message = "El RUC debe tener exactamente 11 dígitos")
        @Pattern(regexp = "^[0-9]+$", message = "El RUC solo puede contener números")
        String ruc,

        @Size(max = 100, message = "El giro comercial no puede exceder 100 caracteres")
        String giroComercial,

        @Size(max = 200, message = "La direccion fiscal no puede exceder 200 caracteres")
        String direccionFiscal,

        @Valid
        RepresentanteDto representante,

        @NotBlank
        @Email(message = "El correo debe tener un formato valido")
        String correo,

        @NotBlank
        @Size(min = 9, max = 15, message = "El telefono debe tener entre 9 y 15 digitos")
        String telefono,

        @Size(max = 200, message = "La direccion no puede exceder 200 caracteres")
        String direccion
) {}
