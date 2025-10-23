package com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions;

public class TipoVehiculoNotFoundException extends RuntimeException {
    public TipoVehiculoNotFoundException(Long id) {
        super("Tipo de vehículo no encontrado con ID: " + id);
    }
}
