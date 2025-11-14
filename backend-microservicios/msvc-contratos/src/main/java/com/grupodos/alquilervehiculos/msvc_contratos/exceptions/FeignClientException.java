package com.grupodos.alquilervehiculos.msvc_contratos.exceptions;

import lombok.Getter;

@Getter
public class FeignClientException extends RuntimeException {
    private final String serviceName;
    private final int status;

    public FeignClientException(String serviceName, String message, int status) {
        super(message);
        this.serviceName = serviceName;
        this.status = status;
    }

}
