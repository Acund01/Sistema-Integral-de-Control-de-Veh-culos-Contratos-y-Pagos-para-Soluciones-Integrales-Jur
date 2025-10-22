package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record DetalleContratoDto(
        @NotNull(message = "El ID del vehículo es requerido")
        UUID idVehiculo,

        @NotNull(message = "El precio diario es requerido")
        @Positive(message = "El precio diario debe ser mayor a 0")
        Double precioDiario
) {}
