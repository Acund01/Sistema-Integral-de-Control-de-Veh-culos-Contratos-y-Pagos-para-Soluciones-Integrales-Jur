package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ModeloRequestDto(
        @NotBlank(message = "El nombre esta en blanco")
        String nombre,

        @NotNull(message = "La marca es obligatoria")
        Long marcaId
) {}
