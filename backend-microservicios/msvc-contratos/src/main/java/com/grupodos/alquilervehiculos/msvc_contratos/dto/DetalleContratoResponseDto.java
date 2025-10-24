package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import java.util.UUID;

public record DetalleContratoResponseDto(
        UUID idDetalle,
        UUID idVehiculo,
        Double precioDiario,
        Integer diasAlquiler,
        Double subtotal,
        String placaVehiculo,
        String marcaVehiculo,
        String modeloVehiculo,
        VehiculoDto vehiculo
) {}
