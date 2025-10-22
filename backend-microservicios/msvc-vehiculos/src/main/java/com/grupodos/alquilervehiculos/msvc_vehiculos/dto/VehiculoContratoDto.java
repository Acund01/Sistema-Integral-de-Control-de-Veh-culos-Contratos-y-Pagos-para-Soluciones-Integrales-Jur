package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;

import java.util.UUID;

public record VehiculoContratoDto(
        UUID id,
        String placa,
        String marca,
        String modelo,  // solo el nombre o id que necesites
        String tipoVehiculo,
        String estado
) {}
