package com.grupodos.alquilervehiculos.msvc_vehiculos.dto;


import java.util.UUID;

public record VehiculoResponseDto(
        UUID id,
        String placa,
        String marca,
        String modelo,
        String tipoVehiculo,
        String estado,
        Boolean activo
) {}
