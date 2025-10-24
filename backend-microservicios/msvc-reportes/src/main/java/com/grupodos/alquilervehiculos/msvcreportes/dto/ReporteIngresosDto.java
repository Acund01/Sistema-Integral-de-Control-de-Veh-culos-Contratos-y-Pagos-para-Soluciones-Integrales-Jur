package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.math.BigDecimal;
import java.time.YearMonth;

public record ReporteIngresosDto(
        YearMonth mes,
        Integer totalContratos,
        BigDecimal totalIngresos,
        BigDecimal promedioPorContrato,
        BigDecimal igvRecaudado,
        Integer cantidadClientes,
        Integer cantidadVehiculosUtilizados
) {}
