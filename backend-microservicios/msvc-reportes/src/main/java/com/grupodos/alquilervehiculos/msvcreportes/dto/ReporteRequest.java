package com.grupodos.alquilervehiculos.msvcreportes.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReporteRequest(
        @NotNull(message = "La fecha de inicio es requerida")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de fin es requerida")
        LocalDate fechaFin,

        String formato // EXCEL o PDF (opcional, por defecto EXCEL)
) {
    public String getFormato() {
        return formato != null ? formato.toUpperCase() : "EXCEL";
    }
}
