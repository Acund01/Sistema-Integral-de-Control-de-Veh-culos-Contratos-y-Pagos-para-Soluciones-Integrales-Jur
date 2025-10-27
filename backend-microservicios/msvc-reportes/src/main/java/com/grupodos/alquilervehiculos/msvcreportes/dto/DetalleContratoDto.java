package com.grupodos.alquilervehiculos.msvcreportes.dto;

import java.util.UUID;

public record DetalleContratoDto(
        UUID idDetalle,
        UUID idVehiculo,
        Double precioDiario,
        Integer diasAlquiler,
        Double subtotal,
        String placaVehiculo,
        String marcaVehiculo,
        String modeloVehiculo
) {}
