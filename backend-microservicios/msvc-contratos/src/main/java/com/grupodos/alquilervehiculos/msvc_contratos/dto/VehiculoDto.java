package com.grupodos.alquilervehiculos.msvc_contratos.dto;

import java.util.UUID;

public record VehiculoDto(
        UUID id,
        String placa,
        String marca,
        String modelo,
        String tipoVehiculo,
        String estado
) {}
