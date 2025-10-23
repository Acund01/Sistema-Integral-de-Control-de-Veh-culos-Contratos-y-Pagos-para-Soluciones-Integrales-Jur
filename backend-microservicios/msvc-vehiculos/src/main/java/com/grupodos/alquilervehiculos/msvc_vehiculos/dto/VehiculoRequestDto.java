package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.TipoCombustible;
import jakarta.validation.constraints.*;

public record VehiculoRequestDto(
        @NotBlank(message = "La placa es obligatoria")
        @Pattern(regexp = "^[A-Z0-9]{6,8}$", message = "Formato de placa invalido")
        String placa,

        @NotNull(message = "El modelo es obligatorio")
        Long modeloId,

        @NotNull(message = "El tipo de vehiculo es obligatorio")
        Long tipoVehiculoId,

        @NotNull(message = "El año es obligatorio")
        @Min(value = 1900, message = "El año debe ser mayor a 1900")
        Integer anioFabricacion,

        @NotNull(message = "El combustible es obligatorio")
        TipoCombustible combustible,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no puede exceder 500 caracteres")
        String descripcion
) {}
