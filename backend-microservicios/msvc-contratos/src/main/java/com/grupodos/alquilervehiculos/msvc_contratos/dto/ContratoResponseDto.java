package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ContratoResponseDto(
        UUID id,
        String codigoContrato,
        ClienteDto cliente,
        List<DetalleContratoResponseDto> detalles,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Integer diasTotales,
        Double montoTotal,
        String estado,
        String observaciones,
        LocalDateTime fechaCreacion,
        LocalDateTime actualizadoEn
) {}
