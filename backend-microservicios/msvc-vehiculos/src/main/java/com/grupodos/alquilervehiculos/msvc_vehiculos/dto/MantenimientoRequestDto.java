package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MantenimientoRequestDto(
    UUID vehiculoId,
    String descripcion,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    BigDecimal costo
) {}
