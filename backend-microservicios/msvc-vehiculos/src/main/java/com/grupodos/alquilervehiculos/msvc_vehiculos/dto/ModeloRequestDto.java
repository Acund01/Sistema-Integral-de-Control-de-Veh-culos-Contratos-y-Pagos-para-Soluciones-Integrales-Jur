package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import jakarta.validation.constraints.NotBlank;

public record ModeloRequestDto(

    @NotBlank(message = "El nombre esta en blanco")
    String nombre,

    @NotBlank
    Long marcaId

) { }
