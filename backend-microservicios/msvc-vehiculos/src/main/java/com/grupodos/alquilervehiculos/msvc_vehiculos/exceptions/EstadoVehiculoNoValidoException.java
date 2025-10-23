package com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions;

public class EstadoVehiculoNoValidoException extends RuntimeException {
    public EstadoVehiculoNoValidoException(String estado) {
        super("Estado de vehículo no válido: " + estado);
    }
}
