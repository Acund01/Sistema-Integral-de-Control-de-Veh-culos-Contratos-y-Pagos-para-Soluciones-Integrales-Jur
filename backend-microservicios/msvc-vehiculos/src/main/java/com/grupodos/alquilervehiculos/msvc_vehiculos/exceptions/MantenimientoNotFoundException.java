package com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions;

public class MantenimientoNotFoundException extends RuntimeException {
    public MantenimientoNotFoundException(Long id) {
        super("Mantenimiento no encontrado con ID: " + id);
    }
}
