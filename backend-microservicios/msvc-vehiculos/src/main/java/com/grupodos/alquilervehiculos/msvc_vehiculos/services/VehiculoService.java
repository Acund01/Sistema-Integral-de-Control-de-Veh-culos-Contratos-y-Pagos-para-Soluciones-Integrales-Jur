package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.VehiculoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.VehiculoResponseDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.TipoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.EstadoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.ModeloNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.RecursoDuplicadoException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.TipoVehiculoNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.VehiculoNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.ModeloRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.TipoVehiculoRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ModeloRepository modeloRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;

    public List<Vehiculo> listarTodos() {
        log.debug("Listando todos los vehículos activos");
        return vehiculoRepository.findAll().stream()
                .filter(Vehiculo::isActivo)
                .toList();
    }

    public List<Vehiculo> listarPorMarca(Long marcaId) {
        log.debug("Listando vehículos por marca ID: {}", marcaId);
        return vehiculoRepository.findByModeloMarcaId(marcaId).stream()
                .filter(Vehiculo::isActivo)
                .toList();
    }

    public List<Vehiculo> listarPorTipo(Long tipoId) {
        log.debug("Listando vehículos por tipo ID: {}", tipoId);
        return vehiculoRepository.findByTipoVehiculoId(tipoId).stream()
                .filter(Vehiculo::isActivo)
                .toList();
    }

    public List<Vehiculo> listarPorEstado(EstadoVehiculo estado) {
        log.debug("Listando vehículos por estado: {}", estado);
        return vehiculoRepository.findByEstadoAndActivoTrue(estado);
    }

    public List<Vehiculo> listarDisponibles() {
        log.debug("Listando vehículos disponibles");
        return vehiculoRepository.findByEstadoAndActivoTrue(EstadoVehiculo.DISPONIBLE);
    }

    public Vehiculo obtenerPorId(UUID id) {
        log.debug("Obteniendo vehículo con ID: {}", id);
        return vehiculoRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> {
                    log.error("Vehículo no encontrado con ID: {}", id);
                    return new VehiculoNotFoundException(id);
                });
    }

    public Vehiculo crearVehiculo(VehiculoRequestDto dto) {
        log.info("Creando vehículo con placa: {}", dto.placa());

        if (StringUtils.isBlank(dto.placa())) {
            throw new IllegalArgumentException("La placa no puede estar vacía");
        }

        String placaNormalizada = StringUtils.upperCase(StringUtils.trim(dto.placa()));

        if (vehiculoRepository.existsByPlaca(placaNormalizada)) {
            log.warn("Intento de crear vehículo con placa duplicada: {}", placaNormalizada);
            throw new RecursoDuplicadoException("Ya existe un vehículo con la placa: " + placaNormalizada);
        }

        Modelo modelo = modeloRepository.findById(dto.modeloId())
                .orElseThrow(() -> {
                    log.error("Modelo no encontrado con ID: {}", dto.modeloId());
                    return new ModeloNotFoundException(dto.modeloId());
                });

        TipoVehiculo tipo = tipoVehiculoRepository.findById(dto.tipoVehiculoId())
                .orElseThrow(() -> {
                    log.error("Tipo de vehículo no encontrado con ID: {}", dto.tipoVehiculoId());
                    return new TipoVehiculoNotFoundException(dto.tipoVehiculoId());
                });

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(placaNormalizada);
        vehiculo.setModelo(modelo);
        vehiculo.setTipoVehiculo(tipo);
        vehiculo.setAnioFabricacion(dto.anioFabricacion());
        vehiculo.setCombustible(dto.combustible());
        vehiculo.setDescripcion(StringUtils.trim(dto.descripcion()));
        vehiculo.setEstado(EstadoVehiculo.DISPONIBLE);
        vehiculo.setActivo(true);
        vehiculo.setCreadoEn(OffsetDateTime.now());

        Vehiculo guardado = vehiculoRepository.save(vehiculo);
        log.info("Vehículo creado exitosamente con ID: {}", guardado.getId());
        return guardado;
    }

    public Vehiculo actualizarVehiculo(UUID id, VehiculoRequestDto dto) {
        log.info("Actualizando vehículo con ID: {}", id);
        Vehiculo existente = obtenerPorId(id);

        String placaNormalizada = StringUtils.upperCase(StringUtils.trim(dto.placa()));
        if (!existente.getPlaca().equals(placaNormalizada) &&
                vehiculoRepository.existsByPlaca(placaNormalizada)) {
            throw new RecursoDuplicadoException("Ya existe un vehículo con la placa: " + placaNormalizada);
        }

        Modelo modelo = modeloRepository.findById(dto.modeloId())
                .orElseThrow(() -> new ModeloNotFoundException(dto.modeloId()));
        TipoVehiculo tipo = tipoVehiculoRepository.findById(dto.tipoVehiculoId())
                .orElseThrow(() -> new TipoVehiculoNotFoundException(dto.tipoVehiculoId()));

        existente.setPlaca(placaNormalizada);
        existente.setModelo(modelo);
        existente.setTipoVehiculo(tipo);
        existente.setAnioFabricacion(dto.anioFabricacion());
        existente.setCombustible(dto.combustible());
        existente.setDescripcion(StringUtils.trim(dto.descripcion()));

        Vehiculo actualizado = vehiculoRepository.save(existente);
        log.info("Vehículo actualizado exitosamente: {}", id);
        return actualizado;
    }

    public void eliminarVehiculo(UUID id) {
        log.info("Eliminando lógicamente vehículo con ID: {}", id);
        Vehiculo existente = obtenerPorId(id);
        existente.setActivo(false);
        vehiculoRepository.save(existente);
        log.debug("Vehículo marcado como inactivo: {}", id);
    }

    public Vehiculo actualizarEstado(UUID id, EstadoVehiculo estado) {
        log.info("Actualizando estado del vehículo {} a: {}", id, estado);
        Vehiculo vehiculo = obtenerPorId(id);

        // Validar transiciones de estado válidas
        validarTransicionEstado(vehiculo.getEstado(), estado);

        vehiculo.setEstado(estado);
        Vehiculo actualizado = vehiculoRepository.save(vehiculo);
        log.info("Estado del vehículo {} actualizado a: {}", id, estado);
        return actualizado;
    }

    private void validarTransicionEstado(EstadoVehiculo estadoActual, EstadoVehiculo nuevoEstado) {
        // Un vehículo alquilado no puede pasar directamente a mantenimiento
        if (estadoActual == EstadoVehiculo.ALQUILADO && nuevoEstado == EstadoVehiculo.EN_MANTENIMIENTO) {
            throw new IllegalStateException("No se puede poner en mantenimiento un vehículo alquilado");
        }

        // Un vehículo en mantenimiento no puede ser alquilado directamente
        if (estadoActual == EstadoVehiculo.EN_MANTENIMIENTO && nuevoEstado == EstadoVehiculo.ALQUILADO) {
            throw new IllegalStateException("No se puede alquilar un vehículo en mantenimiento");
        }
    }

    public boolean verificarDisponibilidad(UUID id) {
        Vehiculo vehiculo = obtenerPorId(id);
        return vehiculo.getEstado() == EstadoVehiculo.DISPONIBLE;
    }

    public List<VehiculoResponseDto> listarTodosParaReportes() {
        log.debug("Obteniendo todos los vehículos para reportes");
        List<Vehiculo> vehiculos = vehiculoRepository.findAll();
        return vehiculos.stream()
                .map(vehiculo -> new VehiculoResponseDto(
                        vehiculo.getId(),
                        vehiculo.getPlaca(),
                        vehiculo.getModelo().getMarca().getNombre(),
                        vehiculo.getModelo().getNombre(),
                        vehiculo.getTipoVehiculo().getNombre(),
                        vehiculo.getEstado().name(),
                        vehiculo.isActivo()
                ))
                .collect(Collectors.toList());
    }
}
