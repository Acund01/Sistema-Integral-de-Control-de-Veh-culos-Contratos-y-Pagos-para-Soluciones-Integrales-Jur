package com.grupodos.alquilervehiculos.msvc_contratos.exceptions;

import java.util.UUID;

public class ComprobanteNotFoundException extends RuntimeException {
    public ComprobanteNotFoundException(UUID id) {
        super("Comprobante no encontrado con ID: " + id);
    }

    public ComprobanteNotFoundException(String message) {
        super(message);
    }
}
