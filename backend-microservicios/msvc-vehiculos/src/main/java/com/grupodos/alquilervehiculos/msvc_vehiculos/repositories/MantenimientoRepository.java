package com.grupodos.alquilervehiculos.msvc_vehiculos.repositories;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Mantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {

    List<Mantenimiento> findByVehiculoId(UUID vehiculoId);

}
