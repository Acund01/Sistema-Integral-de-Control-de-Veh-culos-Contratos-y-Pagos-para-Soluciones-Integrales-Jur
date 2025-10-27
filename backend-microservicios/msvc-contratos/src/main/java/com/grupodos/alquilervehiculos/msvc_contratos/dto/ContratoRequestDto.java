package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContratoRequestDto(
        @NotNull(message = "El ID del cliente es requerido")
        UUID idCliente,

        @NotNull(message = "La fecha de inicio es requerida")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de fin es requerida")
        LocalDate fechaFin,

        String observaciones,

        @NotNull(message = "Los detalles del contrato son requeridos")
        List<DetalleContratoDto> detalles
) {}
