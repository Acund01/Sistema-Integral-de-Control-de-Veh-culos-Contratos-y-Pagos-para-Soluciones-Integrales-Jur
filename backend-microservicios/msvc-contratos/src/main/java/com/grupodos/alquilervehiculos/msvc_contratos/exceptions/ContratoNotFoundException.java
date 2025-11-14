package com.grupodos.alquilervehiculos.msvc_contratos.exceptions;

import java.util.UUID;

public class ContratoNotFoundException extends RuntimeException{
    public ContratoNotFoundException(UUID id) {
        super("Contrato no encontrado con ID: " + id);
    }
}
