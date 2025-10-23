package com.grupodos.alquilervehiculos.msvc_vehiculos.repositories;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Mantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {
    List<Mantenimiento> findByVehiculoId(UUID vehiculoId);
    List<Mantenimiento> findByVehiculoIdAndFinalizadoFalse(UUID vehiculoId);
    List<Mantenimiento> findByFinalizadoFalse();
    List<Mantenimiento> findByVehiculoIdAndFinalizadoTrueOrderByFechaFinDesc(UUID vehiculoId);
}
