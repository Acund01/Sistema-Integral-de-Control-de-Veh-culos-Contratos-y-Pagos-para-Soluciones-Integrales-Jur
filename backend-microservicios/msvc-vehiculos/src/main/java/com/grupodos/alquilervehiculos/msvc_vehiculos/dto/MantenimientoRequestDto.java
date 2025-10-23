package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MantenimientoRequestDto(
        @NotNull(message = "El vehículo es obligatorio")
        UUID vehiculoId,

        @NotBlank(message = "La descripción es obligatoria")
        String descripcion,

        LocalDate fechaInicio,

        LocalDate fechaFin,

        BigDecimal costo
) {}
