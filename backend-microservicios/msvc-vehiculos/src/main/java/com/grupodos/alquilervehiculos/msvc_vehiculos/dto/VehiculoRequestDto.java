package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import jakarta.validation.constraints.*;

public record VehiculoRequestDto (

    @NotBlank(message = "La placa es obligatoria")
    String placa,

    @NotBlank(message = "La marca es obligatoria")
    Long modeloId,

    @NotBlank(message = "El tipo de vehículo es obligatorio")
    Long tipoVehiculoId,

    @NotNull(message = "El año es obligatorio")
    @Max(value = 2026, message = "El año no puede ser mayor al actual")
    Integer anioFabricacion,

    @NotBlank(message = "El tipo de combustible es obligatorio")
    String combustible,

    String descripcion,

    String estado,

    boolean activo

    ) {}
