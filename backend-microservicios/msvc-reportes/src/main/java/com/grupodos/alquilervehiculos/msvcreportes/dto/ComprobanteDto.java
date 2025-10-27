package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ComprobanteDto(
        UUID idComprobante,
        UUID idContrato,
        LocalDateTime fechaEmision,
        String tipoComprobante,
        String numeroSerie,
        String numeroCorrelativo,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total,
        String estado
) {}
