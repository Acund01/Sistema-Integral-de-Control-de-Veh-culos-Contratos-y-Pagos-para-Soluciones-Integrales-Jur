package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.MantenimientoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Mantenimiento;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.EstadoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.MantenimientoNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.VehiculoNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.MantenimientoRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class MantenimientoService {

    private final MantenimientoRepository mantenimientoRepository;
    private final VehiculoRepository vehiculoRepository;

    public List<Mantenimiento> listarTodos() {
        log.debug("Listando todos los mantenimientos");
        return mantenimientoRepository.findAll();
    }

    public Mantenimiento obtenerPorId(Long id) {
        log.debug("Obteniendo mantenimiento con ID: {}", id);
        return mantenimientoRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Mantenimiento no encontrado con ID: {}", id);
                    return new MantenimientoNotFoundException(id);
                });
    }

    public List<Mantenimiento> listarPorVehiculo(UUID vehiculoId) {
        log.debug("Listando mantenimientos para vehículo ID: {}", vehiculoId);
        return mantenimientoRepository.findByVehiculoId(vehiculoId);
    }

    public List<Mantenimiento> listarMantenimientosActivos() {
        log.debug("Listando todos los mantenimientos activos");
        return mantenimientoRepository.findByFinalizadoFalse();
    }

    public List<Mantenimiento> listarMantenimientosActivosPorVehiculo(UUID vehiculoId) {
        log.debug("Listando mantenimientos activos para vehículo ID: {}", vehiculoId);
        return mantenimientoRepository.findByVehiculoIdAndFinalizadoFalse(vehiculoId);
    }

    public List<Mantenimiento> listarHistorialMantenimientos(UUID vehiculoId) {
        log.debug("Listando historial de mantenimientos para vehículo ID: {}", vehiculoId);
        return mantenimientoRepository.findByVehiculoIdAndFinalizadoTrueOrderByFechaFinDesc(vehiculoId);
    }

    public Mantenimiento crearMantenimiento(MantenimientoRequestDto dto) {
        log.info("Creando mantenimiento para vehículo ID: {}", dto.vehiculoId());

        Vehiculo vehiculo = vehiculoRepository.findById(dto.vehiculoId())
                .orElseThrow(() -> {
                    log.error("Vehículo no encontrado para mantenimiento: {}", dto.vehiculoId());
                    return new VehiculoNotFoundException(dto.vehiculoId());
                });

        // Validar que el vehículo esté disponible para mantenimiento
        if (vehiculo.getEstado() != EstadoVehiculo.DISPONIBLE) {
            log.warn("Intento de crear mantenimiento para vehículo no disponible: {}", vehiculo.getEstado());
            throw new IllegalStateException(
                    "El vehículo no está disponible para mantenimiento. Estado actual: " + vehiculo.getEstado()
            );
        }

        // Verificar que no tenga mantenimientos activos
        List<Mantenimiento> mantenimientosActivos = listarMantenimientosActivosPorVehiculo(dto.vehiculoId());
        if (!mantenimientosActivos.isEmpty()) {
            log.warn("El vehículo {} ya tiene mantenimientos activos", dto.vehiculoId());
            throw new IllegalStateException("El vehículo ya tiene mantenimientos en curso");
        }

        // Cambiar estado del vehículo a EN_MANTENIMIENTO
        vehiculo.setEstado(EstadoVehiculo.EN_MANTENIMIENTO);
        vehiculoRepository.save(vehiculo);

        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setVehiculo(vehiculo);
        mantenimiento.setDescripcion(StringUtils.trim(dto.descripcion()));
        mantenimiento.setFechaInicio(ObjectUtils.defaultIfNull(dto.fechaInicio(), LocalDate.now()));
        mantenimiento.setFechaFin(dto.fechaFin());
        mantenimiento.setCosto(ObjectUtils.defaultIfNull(dto.costo(), BigDecimal.ZERO));
        mantenimiento.setFinalizado(false);

        Mantenimiento guardado = mantenimientoRepository.save(mantenimiento);
        log.info("Mantenimiento creado exitosamente con ID: {} para vehículo: {}",
                guardado.getId(), dto.vehiculoId());
        return guardado;
    }

    public Mantenimiento finalizarMantenimiento(Long id) {
        log.info("Finalizando mantenimiento ID: {}", id);
        Mantenimiento mantenimiento = obtenerPorId(id);

        if (mantenimiento.isFinalizado()) {
            throw new IllegalStateException("El mantenimiento ya está finalizado");
        }

        // Actualizar fechas y estado del mantenimiento
        mantenimiento.setFechaFin(LocalDate.now());
        mantenimiento.setFinalizado(true);

        // Cambiar estado del vehículo a DISPONIBLE
        Vehiculo vehiculo = mantenimiento.getVehiculo();
        vehiculo.setEstado(EstadoVehiculo.DISPONIBLE);
        vehiculoRepository.save(vehiculo);

        Mantenimiento finalizado = mantenimientoRepository.save(mantenimiento);
        log.info("Mantenimiento finalizado exitosamente: {}", id);
        return finalizado;
    }

    public Mantenimiento actualizarMantenimiento(Long id, MantenimientoRequestDto dto) {
        log.info("Actualizando mantenimiento ID: {}", id);
        Mantenimiento mantenimiento = obtenerPorId(id);

        if (mantenimiento.isFinalizado()) {
            throw new IllegalStateException("No se puede modificar un mantenimiento finalizado");
        }

        // Si cambia el vehículo, validar el nuevo vehículo
        if (!mantenimiento.getVehiculo().getId().equals(dto.vehiculoId())) {
            Vehiculo nuevoVehiculo = vehiculoRepository.findById(dto.vehiculoId())
                    .orElseThrow(() -> new VehiculoNotFoundException(dto.vehiculoId()));

            // Revertir estado del vehículo anterior
            Vehiculo vehiculoAnterior = mantenimiento.getVehiculo();
            vehiculoAnterior.setEstado(EstadoVehiculo.DISPONIBLE);
            vehiculoRepository.save(vehiculoAnterior);

            // Validar y cambiar estado del nuevo vehículo
            if (nuevoVehiculo.getEstado() != EstadoVehiculo.DISPONIBLE) {
                throw new IllegalStateException("El nuevo vehículo no está disponible para mantenimiento");
            }
            nuevoVehiculo.setEstado(EstadoVehiculo.EN_MANTENIMIENTO);
            vehiculoRepository.save(nuevoVehiculo);

            mantenimiento.setVehiculo(nuevoVehiculo);
        }

        mantenimiento.setDescripcion(StringUtils.trim(dto.descripcion()));
        mantenimiento.setFechaInicio(ObjectUtils.defaultIfNull(dto.fechaInicio(), mantenimiento.getFechaInicio()));
        mantenimiento.setFechaFin(dto.fechaFin());
        mantenimiento.setCosto(ObjectUtils.defaultIfNull(dto.costo(), mantenimiento.getCosto()));

        Mantenimiento actualizado = mantenimientoRepository.save(mantenimiento);
        log.info("Mantenimiento actualizado exitosamente: {}", id);
        return actualizado;
    }

    public void eliminarMantenimiento(Long id) {
        log.info("Eliminando mantenimiento ID: {}", id);
        Mantenimiento mantenimiento = obtenerPorId(id);

        // Si el mantenimiento está activo, revertir el estado del vehículo
        if (!mantenimiento.isFinalizado()) {
            Vehiculo vehiculo = mantenimiento.getVehiculo();
            vehiculo.setEstado(EstadoVehiculo.DISPONIBLE);
            vehiculoRepository.save(vehiculo);
            log.debug("Estado del vehículo {} revertido a DISPONIBLE", vehiculo.getId());
        }

        mantenimientoRepository.delete(mantenimiento);
        log.debug("Mantenimiento eliminado: {}", id);
    }

    public BigDecimal obtenerCostoTotalMantenimientos(UUID vehiculoId) {
        log.debug("Calculando costo total de mantenimientos para vehículo: {}", vehiculoId);
        List<Mantenimiento> mantenimientos = mantenimientoRepository.findByVehiculoId(vehiculoId);

        return mantenimientos.stream()
                .map(Mantenimiento::getCosto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Mantenimiento> listarMantenimientosProximosAVencer(LocalDate fechaLimite) {
        log.debug("Listando mantenimientos próximos a vencer antes de: {}", fechaLimite);
        return mantenimientoRepository.findByFinalizadoFalse().stream()
                .filter(m -> m.getFechaFin() != null && m.getFechaFin().isBefore(fechaLimite))
                .toList();
    }
}
