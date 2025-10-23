package com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions;

public class ModeloNotFoundException extends RuntimeException {
    public ModeloNotFoundException(Long id) {
        super("Modelo no encontrado con ID: " + id);
    }
}
