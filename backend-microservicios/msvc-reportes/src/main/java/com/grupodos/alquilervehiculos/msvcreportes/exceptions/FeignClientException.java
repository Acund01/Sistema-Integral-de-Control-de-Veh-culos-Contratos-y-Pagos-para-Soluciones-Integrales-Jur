package com.grupodos.alquilervehiculos.msvcreportes.exceptions;

public class FeignClientException extends RuntimeException {
    private final String serviceName;
    private final int status;

    public FeignClientException(String serviceName, String message, int status) {
        super(message);
        this.serviceName = serviceName;
        this.status = status;
    }

    public String getServiceName() { return serviceName; }
    public int getStatus() { return status; }
}
