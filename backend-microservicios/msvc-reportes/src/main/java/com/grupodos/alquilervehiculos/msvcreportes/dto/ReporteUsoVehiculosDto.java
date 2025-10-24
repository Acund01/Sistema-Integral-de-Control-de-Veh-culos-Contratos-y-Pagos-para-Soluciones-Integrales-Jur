package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReporteUsoVehiculosDto(
        String placa,
        String marca,
        String modelo,
        String tipoVehiculo,
        Integer totalDiasAlquilados,
        Integer cantidadContratos,
        BigDecimal totalRecaudado,
        Double porcentajeUso,
        LocalDate ultimoAlquiler
) {}
