package com.grupodos.alquilervehiculos.msvcclientes.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarRecursoNoEncontrado(
            RecursoNoEncontradoException ex, WebRequest request) {

        return construirRespuesta(
                HttpStatus.NOT_FOUND,
                "Recurso no encontrado",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(ValidacionException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            ValidacionException ex, WebRequest request) {

        return construirRespuesta(
                HttpStatus.BAD_REQUEST,
                "Error de validación",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarErrorGeneral(
            Exception ex, WebRequest request) {

        return construirRespuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor",
                ex.getMessage(),
                request
        );
    }

    private ResponseEntity<Map<String, Object>> construirRespuesta(
            HttpStatus status,
            String error,
            String mensaje,
            WebRequest request) {

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now());
        cuerpo.put("status", status.value());
        cuerpo.put("error", error);
        cuerpo.put("mensaje", mensaje);
        cuerpo.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.status(status).body(cuerpo);
    }
}
