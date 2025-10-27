package com.grupodos.alquilervehiculos.msvcclientes.exceptions;

public class ValidacionException extends RuntimeException {
    public ValidacionException(String mensaje) {
        super(mensaje);
    }

    public ValidacionException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
