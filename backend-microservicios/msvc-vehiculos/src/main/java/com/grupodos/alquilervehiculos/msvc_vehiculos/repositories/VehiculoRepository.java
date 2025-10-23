package com.grupodos.alquilervehiculos.msvc_vehiculos.repositories;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.EstadoVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, UUID> {
    List<Vehiculo> findByModeloMarcaId(Long marcaId);
    List<Vehiculo> findByTipoVehiculoId(Long tipoId);
    boolean existsByPlaca(String placa);
    Optional<Vehiculo> findByIdAndActivoTrue(UUID id);
    List<Vehiculo> findByEstadoAndActivoTrue(EstadoVehiculo estado);
    List<Vehiculo> findByEstadoInAndActivoTrue(List<EstadoVehiculo> estados);
}