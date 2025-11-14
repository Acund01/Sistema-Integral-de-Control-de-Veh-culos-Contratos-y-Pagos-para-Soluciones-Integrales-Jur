package com.grupodos.alquilervehiculos.msvcreportes.exceptions;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ReporteGenerationException.class)
    public ResponseEntity<Map<String, Object>> handleReporteGenerationException(
            ReporteGenerationException ex, WebRequest request) {
        log.error("Error generando reporte: {}", ex.getMessage(), ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Error Generando Reporte");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ReporteNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleReporteNotFoundException(
            ReporteNotFoundException ex, WebRequest request) {
        log.warn("Reporte no encontrado: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Reporte No Encontrado");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidDateRangeException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidDateRangeException(
            InvalidDateRangeException ex, WebRequest request) {
        log.warn("Rango de fechas inválido: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Rango de Fechas Inválido");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(
            FeignException ex, WebRequest request) {
        log.error("Error en comunicación con microservicio: {}", ex.getMessage());

        String errorMessage = "Error en comunicación con servicio externo";
        int statusCode = ex.status();
        HttpStatus httpStatus;

        if (statusCode == -1) {
            httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
            errorMessage = "Microservicio no disponible - error de conexión";
        } else {
            try {
                httpStatus = HttpStatus.valueOf(statusCode);
                if (statusCode == 404) {
                    errorMessage = "Recurso no encontrado en servicio externo";
                } else if (statusCode >= 500) {
                    errorMessage = "Error interno en servicio externo";
                }
            } catch (IllegalArgumentException e) {
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", httpStatus.value());
        body.put("error", "Error de Comunicación");
        body.put("message", errorMessage);
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, httpStatus);
    }

    @ExceptionHandler(FeignClientException.class)
    public ResponseEntity<Map<String, Object>> handleFeignClientException(
            FeignClientException ex, WebRequest request) {
        log.error("Error en comunicación con {}: {}", ex.getServiceName(), ex.getMessage());

        int statusCode = ex.getStatus();
        HttpStatus httpStatus;

        if (statusCode == -1) {
            httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
        } else {
            try {
                httpStatus = HttpStatus.valueOf(statusCode);
            } catch (IllegalArgumentException e) {
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", httpStatus.value());
        body.put("error", "Error de Microservicio");
        body.put("message", ex.getMessage());
        body.put("service", ex.getServiceName());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, httpStatus);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, Object>> handleIOException(
            IOException ex, WebRequest request) {
        log.error("Error de E/S generando archivo: {}", ex.getMessage(), ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Error Generando Archivo");
        body.put("message", "Error al generar el archivo de reporte");
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("Argumento inválido: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Solicitud Inválida");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        log.error("Error interno del servidor: {}", ex.getMessage(), ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Error Interno del Servidor");
        body.put("message", "Ocurrió un error inesperado en el servidor");
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
