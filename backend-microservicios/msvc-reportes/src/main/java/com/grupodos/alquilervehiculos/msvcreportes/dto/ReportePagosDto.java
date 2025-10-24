package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReportePagosDto(
        String numeroComprobante,
        LocalDateTime fechaEmision,
        String tipoComprobante,
        String cliente,
        String documentoCliente,
        String tipoCliente,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total,
        String estadoComprobante,
        String codigoContrato
) {}
