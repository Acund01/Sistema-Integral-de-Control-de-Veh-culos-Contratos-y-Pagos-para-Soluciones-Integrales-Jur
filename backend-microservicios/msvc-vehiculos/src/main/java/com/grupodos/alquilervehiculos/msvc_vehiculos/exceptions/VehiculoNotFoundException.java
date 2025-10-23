package com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions;

import java.util.UUID;

public class VehiculoNotFoundException extends RuntimeException {
    public VehiculoNotFoundException(UUID id) {
        super("Vehículo no encontrado con ID: " + id);
    }
}
