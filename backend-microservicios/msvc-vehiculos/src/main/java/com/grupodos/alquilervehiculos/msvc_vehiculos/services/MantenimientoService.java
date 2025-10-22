package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.MantenimientoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Mantenimiento;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.MantenimientoRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class MantenimientoService {

    private final MantenimientoRepository mantenimientoRepository;
    private final VehiculoRepository vehiculoRepository;

    public MantenimientoService(MantenimientoRepository mantenimientoRepository,
                                VehiculoRepository vehiculoRepository) {
        this.mantenimientoRepository = mantenimientoRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    // Listar todos los mantenimientos
    public List<Mantenimiento> listarTodos() {
        return mantenimientoRepository.findAll();
    }

    // Obtener mantenimiento por ID
    public Mantenimiento obtenerPorId(Long id) {
        return mantenimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mantenimiento no encontrado"));
    }

    // Listar mantenimientos de un vehículo
    public List<Mantenimiento> listarPorVehiculo(UUID vehiculoId) {
        return mantenimientoRepository.findByVehiculoId(vehiculoId);
    }

    // Crear mantenimiento y actualizar estado del vehículo a MANTENIMIENTO
    public Mantenimiento crearMantenimiento(MantenimientoRequestDto dto) {
        Vehiculo vehiculo = vehiculoRepository.findById(dto.vehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // Cambiar el estado del vehículo
        vehiculo.setEstado("MANTENIMIENTO");
        vehiculoRepository.save(vehiculo);

        Mantenimiento m = new Mantenimiento();
        m.setVehiculo(vehiculo);
        m.setDescripcion(dto.descripcion());
        m.setFechaInicio(dto.fechaInicio() != null ? dto.fechaInicio() : LocalDate.now(ZoneId.of("America/Lima")));
        m.setFechaFin(dto.fechaFin());
        m.setCosto(dto.costo() != null ? dto.costo() : BigDecimal.ZERO);

        return mantenimientoRepository.save(m);
    }

    // Finalizar mantenimiento y actualizar estado del vehículo a DISPONIBLE
    public Mantenimiento finalizarMantenimiento(Long id) {
        Mantenimiento m = mantenimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mantenimiento no encontrado"));

        m.setFechaFin(LocalDate.now());

        Vehiculo vehiculo = m.getVehiculo();
        vehiculo.setEstado("DISPONIBLE");
        vehiculoRepository.save(vehiculo);
        m.setFinalizado(true);
        return mantenimientoRepository.save(m);
    }


    public void eliminarMantenimiento(Long id) {
        Mantenimiento m = mantenimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mantenimiento no encontrado"));

        // revertir estado del vehículo al eliminar mantenimiento
        Vehiculo vehiculo = m.getVehiculo();
        if ("MANTENIMIENTO".equals(vehiculo.getEstado())) {
            vehiculo.setEstado("DISPONIBLE");
            vehiculoRepository.save(vehiculo);
        }
        mantenimientoRepository.save(m);
    }
    
}
