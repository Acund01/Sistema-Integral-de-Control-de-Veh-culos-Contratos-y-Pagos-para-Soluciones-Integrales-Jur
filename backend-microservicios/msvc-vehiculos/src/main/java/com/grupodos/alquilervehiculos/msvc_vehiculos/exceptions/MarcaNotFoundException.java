package com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions;

public class MarcaNotFoundException extends RuntimeException {
    public MarcaNotFoundException(Long id) {
        super("Marca no encontrada con ID: " + id);
    }
}
