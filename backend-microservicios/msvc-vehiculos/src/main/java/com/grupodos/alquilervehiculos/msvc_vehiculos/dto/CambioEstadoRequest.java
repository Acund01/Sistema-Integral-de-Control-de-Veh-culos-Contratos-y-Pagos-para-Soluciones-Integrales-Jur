package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.EstadoVehiculo;
import jakarta.validation.constraints.NotNull;

public record CambioEstadoRequest(
        @NotNull(message = "El estado es obligatorio")
        EstadoVehiculo estado
) {}
