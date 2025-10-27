package com.grupodos.alquilervehiculos.msvcclientes.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarRecursoNoEncontrado(
            RecursoNoEncontradoException ex, WebRequest request) {

        log.warn("Recurso no encontrado: {}", ex.getMessage());
        return construirRespuesta(
                HttpStatus.NOT_FOUND,
                "RECURSO_NO_ENCONTRADO",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(ValidacionException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            ValidacionException ex, WebRequest request) {

        log.warn("Error de validación: {}", ex.getMessage());
        return construirRespuesta(
                HttpStatus.BAD_REQUEST,
                "ERROR_VALIDACION",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler({
            IllegalArgumentException.class,
            NullPointerException.class,
            IllegalStateException.class
    })
    public ResponseEntity<Map<String, Object>> manejarPrecondiciones(
            RuntimeException ex, WebRequest request) {

        log.warn("Violación de precondición: {}", ex.getMessage());
        return construirRespuesta(
                HttpStatus.BAD_REQUEST,
                "PRECONDICION_FALLIDA",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacionBean(
            MethodArgumentNotValidException ex, WebRequest request) {

        log.warn("Error de validación Bean Validation: {}", ex.getMessage());

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now());
        cuerpo.put("status", HttpStatus.BAD_REQUEST.value());
        cuerpo.put("error", "VALIDACION_DTO_FALLIDA");
        cuerpo.put("message", "Errores de validación en los datos de entrada");
        cuerpo.put("path", request.getDescription(false).replace("uri=", ""));

        List<Map<String, String>> errores = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> {
                    Map<String, String> errorMap = new LinkedHashMap<>();
                    errorMap.put("campo", error.getField());
                    errorMap.put("mensaje", error.getDefaultMessage());
                    errorMap.put("valorRechazado",
                            error.getRejectedValue() != null ?
                                    error.getRejectedValue().toString() : "null");
                    return errorMap;
                })
                .collect(Collectors.toList());

        cuerpo.put("errores", errores);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarErrorGeneral(
            Exception ex, WebRequest request) {

        log.error("Error interno del servidor: {}", ex.getMessage(), ex);
        return construirRespuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "ERROR_INTERNO",
                "Ocurrió un error interno en el servidor",
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
        cuerpo.put("message", mensaje);
        cuerpo.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.status(status).body(cuerpo);
    }
}
