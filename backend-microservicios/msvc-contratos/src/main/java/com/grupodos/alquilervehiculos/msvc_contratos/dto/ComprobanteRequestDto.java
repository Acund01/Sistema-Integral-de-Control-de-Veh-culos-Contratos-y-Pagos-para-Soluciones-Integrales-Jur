package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import java.util.UUID;

public record ComprobanteRequestDto(
        UUID idContrato,
        String tipoComprobante // "FACTURA" o "BOLETA"
) {}
