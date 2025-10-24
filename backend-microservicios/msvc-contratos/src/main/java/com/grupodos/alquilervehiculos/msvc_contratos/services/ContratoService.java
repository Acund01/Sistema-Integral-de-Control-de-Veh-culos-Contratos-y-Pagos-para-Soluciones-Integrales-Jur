package com.grupodos.alquilervehiculos.msvc_contratos.services;

import com.grupodos.alquilervehiculos.msvc_contratos.dto.*;

import java.time.LocalDate;
import java.util.*;

public interface ContratoService {

    List<ContratoResponseDto> listarContratos();
    ContratoResponseDto obtenerPorId(UUID id);
    ContratoResponseDto crearContrato(ContratoRequestDto dto);
    ContratoResponseDto actualizarContrato(UUID id, ContratoRequestDto dto);
    void eliminarContrato(UUID id);
    ContratoResponseDto finalizarContrato(UUID id);
    ContratoResponseDto cancelarContrato(UUID id);
    List<ContratoResponseDto> obtenerContratosPorRangoFechas(LocalDate fechaInicio, LocalDate fechaFin);
}
