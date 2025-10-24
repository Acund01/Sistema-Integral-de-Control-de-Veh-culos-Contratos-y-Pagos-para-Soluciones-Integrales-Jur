package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RangoFechasRequest(
        @NotNull(message = "La fecha de inicio es requerida")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de fin es requerida")
        LocalDate fechaFin
) {}
