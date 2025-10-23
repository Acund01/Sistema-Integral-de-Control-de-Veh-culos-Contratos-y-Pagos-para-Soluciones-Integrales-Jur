package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record MarcaConModelosRequestDto(
        @NotBlank(message = "El nombre de la marca es obligatorio")
        String nombreMarca,

        @NotEmpty(message = "Debe incluir al menos un modelo")
        List<@NotBlank String> modelos
) {}
