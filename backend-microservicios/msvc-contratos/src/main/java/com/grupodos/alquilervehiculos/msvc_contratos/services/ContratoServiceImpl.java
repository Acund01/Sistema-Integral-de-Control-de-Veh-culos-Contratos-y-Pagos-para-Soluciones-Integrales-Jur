package com.grupodos.alquilervehiculos.msvc_contratos.services;

import com.grupodos.alquilervehiculos.msvc_contratos.clients.ClienteFeignClient;
import com.grupodos.alquilervehiculos.msvc_contratos.clients.VehiculoFeignClient;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.*;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.Contrato;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.DetalleContrato;
import com.grupodos.alquilervehiculos.msvc_contratos.enums.EstadoVehiculo;
import com.grupodos.alquilervehiculos.msvc_contratos.repositories.ContratoRepository;
import feign.FeignException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ContratoServiceImpl implements ContratoService {

    private final ContratoRepository contratoRepository;
    private final ClienteFeignClient clienteClient;
    private final VehiculoFeignClient vehiculoClient;

    @Override
    public List<ContratoResponseDto> listarContratos() {
        return contratoRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ContratoResponseDto obtenerPorId(UUID id) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado con ID: " + id));
        return mapToResponse(contrato);
    }

    @Transactional
    @Override
    public ContratoResponseDto crearContrato(ContratoRequestDto dto) {
        // Validar fechas
        validarFechasContrato(dto.fechaInicio(), dto.fechaFin());

        // Verificar que el cliente existe
        ClienteDto cliente = obtenerClienteValidado(dto.idCliente());

        // Generar código único
        String codigoContrato = generarCodigoContrato();

        // Calcular días totales
        int diasTotales = (int) java.time.temporal.ChronoUnit.DAYS.between(dto.fechaInicio(), dto.fechaFin()) + 1;

        // Crear contrato
        Contrato contrato = new Contrato();
        contrato.setIdCliente(dto.idCliente());
        contrato.setCodigoContrato(codigoContrato);
        contrato.setFechaInicio(dto.fechaInicio());
        contrato.setFechaFin(dto.fechaFin());
        contrato.setDiasTotales(diasTotales);
        contrato.setObservaciones(dto.observaciones());
        contrato.setCreadoPor("SISTEMA");

        double total = 0;
        List<DetalleContrato> detalles = new ArrayList<>();

        for (DetalleContratoDto detalleDto : dto.detalles()) {
            // Verificar que el vehículo existe y está disponible
            VehiculoDto vehiculo = obtenerVehiculoValidado(detalleDto.idVehiculo());

            if (!"DISPONIBLE".equals(vehiculo.estado())) {
                throw new RuntimeException("El vehículo con placa " + vehiculo.placa() + " no está disponible. Estado: " + vehiculo.estado());
            }

            DetalleContrato detalle = new DetalleContrato(
                    contrato,
                    detalleDto.idVehiculo(),
                    detalleDto.precioDiario(),
                    diasTotales,
                    vehiculo.placa(),
                    vehiculo.marca(),
                    vehiculo.modelo()
            );

            detalles.add(detalle);
            total += detalle.getSubtotal();

            try {
                vehiculoClient.actualizarEstado(detalleDto.idVehiculo(),
                        new CambioEstadoVehDto(EstadoVehiculo.ALQUILADO));
            } catch (FeignException e) {
                throw new RuntimeException("Error al actualizar estado del vehículo: " + e.getMessage());
            }
        }

        contrato.setDetalles(detalles);
        contrato.setMontoTotal(total);

        contratoRepository.save(contrato);
        return mapToResponse(contrato);
    }

    @Transactional
    @Override
    public ContratoResponseDto actualizarContrato(UUID id, ContratoRequestDto dto) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado con ID: " + id));

        // Solo permitir actualizar contratos ACTIVOS
        if (!"ACTIVO".equals(contrato.getEstado())) {
            throw new RuntimeException("Solo se pueden actualizar contratos en estado ACTIVO");
        }

        validarFechasContrato(dto.fechaInicio(), dto.fechaFin());

        // Calcular nuevos días totales
        int nuevosDiasTotales = (int) java.time.temporal.ChronoUnit.DAYS.between(dto.fechaInicio(), dto.fechaFin()) + 1;

        // Liberar vehículos anteriores
        for (DetalleContrato detalle : contrato.getDetalles()) {
            try {
                vehiculoClient.actualizarEstado(detalle.getIdVehiculo(),
                        new CambioEstadoVehDto(EstadoVehiculo.DISPONIBLE));
            } catch (FeignException e) {
                System.err.println("Error liberando vehículo: " + e.getMessage());
            }
        }

        contrato.getDetalles().clear();
        contrato.setFechaInicio(dto.fechaInicio());
        contrato.setFechaFin(dto.fechaFin());
        contrato.setDiasTotales(nuevosDiasTotales);
        contrato.setObservaciones(dto.observaciones());

        double total = 0;
        for (DetalleContratoDto detalleDto : dto.detalles()) {
            VehiculoDto vehiculo = obtenerVehiculoValidado(detalleDto.idVehiculo());

            if (!"DISPONIBLE".equals(vehiculo.estado())) {
                throw new RuntimeException("El vehículo con placa " + vehiculo.placa() + " no está disponible");
            }

            DetalleContrato detalle = new DetalleContrato(
                    contrato,
                    detalleDto.idVehiculo(),
                    detalleDto.precioDiario(),
                    nuevosDiasTotales,
                    vehiculo.placa(),
                    vehiculo.marca(),
                    vehiculo.modelo()
            );

            contrato.getDetalles().add(detalle);
            total += detalle.getSubtotal();

            try {
                vehiculoClient.actualizarEstado(detalleDto.idVehiculo(),
                        new CambioEstadoVehDto(EstadoVehiculo.ALQUILADO));
            } catch (FeignException e) {
                throw new RuntimeException("Error al actualizar estado del vehículo: " + e.getMessage());
            }
        }

        contrato.setMontoTotal(total);
        contratoRepository.save(contrato);

        return mapToResponse(contrato);
    }

    @Transactional
    @Override
    public void eliminarContrato(UUID id) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado con ID: " + id));

        // Solo permitir eliminar contratos ACTIVOS
        if (!"ACTIVO".equals(contrato.getEstado())) {
            throw new RuntimeException("Solo se pueden eliminar contratos en estado ACTIVO");
        }

        // Liberar vehículos
        for (DetalleContrato detalle : contrato.getDetalles()) {
            try {
                vehiculoClient.actualizarEstado(detalle.getIdVehiculo(),
                        new CambioEstadoVehDto(EstadoVehiculo.DISPONIBLE));
            } catch (FeignException e) {
                System.err.println("Error liberando vehículo: " + e.getMessage());
            }
        }

        contratoRepository.delete(contrato);
    }

    @Transactional
    @Override
    public ContratoResponseDto finalizarContrato(UUID id) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado con ID: " + id));

        if (!"ACTIVO".equals(contrato.getEstado())) {
            throw new RuntimeException("Solo se pueden finalizar contratos en estado ACTIVO");
        }

        // Liberar vehículos
        for (DetalleContrato detalle : contrato.getDetalles()) {
            try {
                vehiculoClient.actualizarEstado(detalle.getIdVehiculo(),
                        new CambioEstadoVehDto(EstadoVehiculo.DISPONIBLE));
            } catch (FeignException e) {
                System.err.println("Error liberando vehículo: " + e.getMessage());
            }
        }

        contrato.setEstado("FINALIZADO");
        contratoRepository.save(contrato);

        return mapToResponse(contrato);
    }

    @Transactional
    @Override
    public ContratoResponseDto cancelarContrato(UUID id) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado con ID: " + id));

        if (!"ACTIVO".equals(contrato.getEstado())) {
            throw new RuntimeException("Solo se pueden cancelar contratos en estado ACTIVO");
        }

        // Liberar vehículos
        for (DetalleContrato detalle : contrato.getDetalles()) {
            try {
                vehiculoClient.actualizarEstado(detalle.getIdVehiculo(),
                        new CambioEstadoVehDto(EstadoVehiculo.DISPONIBLE));
            } catch (FeignException e) {
                System.err.println("Error liberando vehículo: " + e.getMessage());
            }
        }

        contrato.setEstado("CANCELADO");
        contratoRepository.save(contrato);

        return mapToResponse(contrato);
    }

    private ContratoResponseDto mapToResponse(Contrato contrato) {
        ClienteDto cliente = obtenerClienteValidado(contrato.getIdCliente());

        List<DetalleContratoResponseDto> detallesResponse = contrato.getDetalles().stream()
                .map(detalle -> {
                    VehiculoDto vehiculo = obtenerVehiculoValidado(detalle.getIdVehiculo());
                    return new DetalleContratoResponseDto(
                            detalle.getId(),
                            detalle.getIdVehiculo(),
                            detalle.getPrecioDiario(),
                            detalle.getDiasAlquiler(),
                            detalle.getSubtotal(),
                            detalle.getPlacaVehiculo(),
                            detalle.getMarcaVehiculo(),
                            detalle.getModeloVehiculo(),
                            vehiculo
                    );
                })
                .toList();

        return new ContratoResponseDto(
                contrato.getId(),
                contrato.getCodigoContrato(),
                cliente,
                detallesResponse,
                contrato.getFechaInicio(),
                contrato.getFechaFin(),
                contrato.getDiasTotales(),
                contrato.getMontoTotal(),
                contrato.getEstado(),
                contrato.getObservaciones(),
                contrato.getFechaCreacion(),
                contrato.getActualizadoEn()
        );
    }

    private ClienteDto obtenerClienteValidado(UUID idCliente) {
        try {
            return clienteClient.obtenerClientePorId(idCliente);
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Cliente no encontrado con ID: " + idCliente);
        } catch (FeignException e) {
            throw new RuntimeException("Error al obtener información del cliente: " + e.getMessage());
        }
    }

    private VehiculoDto obtenerVehiculoValidado(UUID idVehiculo) {
        try {
            return vehiculoClient.obtenerVehiculoPorId(idVehiculo);
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Vehículo no encontrado con ID: " + idVehiculo);
        } catch (FeignException e) {
            throw new RuntimeException("Error al obtener información del vehículo: " + e.getMessage());
        }
    }

    private void validarFechasContrato(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaInicio == null || fechaFin == null) {
            throw new RuntimeException("Las fechas de inicio y fin son requeridas");
        }

        if (fechaInicio.isBefore(LocalDate.now())) {
            throw new RuntimeException("La fecha de inicio no puede ser en el pasado");
        }
        if (fechaFin.isBefore(fechaInicio)) {
            throw new RuntimeException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
    }

    private String generarCodigoContrato() {
        String prefix = "CT-" + LocalDate.now().getYear() + "-";
        Long ultimoNumero = contratoRepository.findMaxNumeroContratoByYear(LocalDate.now().getYear());
        long nuevoNumero = (ultimoNumero == null ? 0 : ultimoNumero) + 1;
        return prefix + String.format("%04d", nuevoNumero);
    }

    public List<ContratoResponseDto> obtenerContratosPorRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {

        List<Contrato> contratos = contratoRepository.findAll();

        return contratos.stream()
                .filter(c -> c.getFechaCreacion() != null)
                .filter(c -> {
                    LocalDate fechaCreacion = c.getFechaCreacion().toLocalDate();
                    return !fechaCreacion.isBefore(fechaInicio) && !fechaCreacion.isAfter(fechaFin);
                })
                .map(this::mapToResponse) // Usa tu metodo existente
                .collect(Collectors.toList());
    }
}
