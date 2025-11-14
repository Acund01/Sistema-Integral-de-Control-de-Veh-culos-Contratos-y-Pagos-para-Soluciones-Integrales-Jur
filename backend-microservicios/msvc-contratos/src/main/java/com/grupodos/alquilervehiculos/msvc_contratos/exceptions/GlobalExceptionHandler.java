package com.grupodos.alquilervehiculos.msvc_contratos.exceptions;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(ContratoNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleContratoNotFound(ContratoNotFoundException ex,
                                                                      WebRequest request) {
        log.warn("Contrato no encontrado: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Contrato No Encontrado");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ComprobanteNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleComprobanteNotFound(ComprobanteNotFoundException ex,
                                                                         WebRequest request) {
        log.warn("Comprobante no encontrado: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Comprobante No Encontrado");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EstadoContratoException.class)
    public ResponseEntity<Map<String, Object>> handleEstadoContrato(EstadoContratoException ex,
                                                                    WebRequest request) {
        log.warn("Error de estado de contrato: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Estado de Contrato Inválido");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ValidacionException.class)
    public ResponseEntity<Map<String, Object>> handleValidacion(ValidacionException ex,
                                                                WebRequest request) {
        log.warn("Error de validación: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Error de Validación");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FeignClientException.class)
    public ResponseEntity<Map<String, Object>> handleFeignClientException(FeignClientException ex,
                                                                          WebRequest request) {
        log.error("Error en comunicación con {}: {}", ex.getServiceName(), ex.getMessage());

        // Manejar el caso especial del status -1 (conexión fallida)
        int statusCode = ex.getStatus();
        HttpStatus httpStatus;

        if (statusCode == -1) {
            httpStatus = HttpStatus.SERVICE_UNAVAILABLE; // 503
        } else {
            try {
                httpStatus = HttpStatus.valueOf(statusCode);
            } catch (IllegalArgumentException e) {
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // 500 para status codes inválidos
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

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(FeignException ex,
                                                                    WebRequest request) {
        log.error("Error en comunicación con microservicio: {}", ex.getMessage());

        String errorMessage = "Error en comunicación con servicio externo";
        int statusCode = ex.status();
        HttpStatus httpStatus;

        // Manejar el caso especial del status -1
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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex,
                                                                          WebRequest request) {
        log.warn("Error de validación de datos: {}", ex.getMessage());

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Datos de Entrada Inválidos");
        body.put("message", "Errores de validación en los datos enviados");
        body.put("errors", errors);
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex,
                                                                      WebRequest request) {
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
