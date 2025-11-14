package com.grupodos.alquilervehiculos.msvcreportes.exceptions;

import java.util.UUID;

public class ReporteNotFoundException extends RuntimeException {
    public ReporteNotFoundException(UUID id) {
        super("Reporte no encontrado con ID: " + id);
    }
}
