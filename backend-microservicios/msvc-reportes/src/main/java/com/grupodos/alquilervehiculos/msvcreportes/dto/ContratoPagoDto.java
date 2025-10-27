package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ContratoPagoDto(
        UUID id,
        String codigoContrato,
        ClienteDto cliente,
        List<DetalleContratoDto> detalles,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Integer diasTotales,
        Double montoTotal,
        String estado,
        String observaciones,
        LocalDateTime fechaCreacion
) {}
