package com.grupodos.alquilervehiculos.msvcclientes.dto;

import com.grupodos.alquilervehiculos.msvcclientes.entities.Representante;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public record ClienteEmpresaDto(
        @NotBlank
        String razonSocial,

        @NotBlank
        String ruc,

        String giroComercial,

        String direccionFiscal,

        @Valid
        Representante representante,

        @NotBlank
        String correo,

        @NotBlank
        String telefono,

        String direccion
) {}
