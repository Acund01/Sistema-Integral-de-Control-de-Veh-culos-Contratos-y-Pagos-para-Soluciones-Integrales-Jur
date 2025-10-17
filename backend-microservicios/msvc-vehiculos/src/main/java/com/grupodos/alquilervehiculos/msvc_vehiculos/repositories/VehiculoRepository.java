package com.grupodos.alquilervehiculos.msvc_vehiculos.repositories;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface VehiculoRepository extends JpaRepository<Vehiculo, UUID> {

    List<Vehiculo> findByModeloMarcaId(Long marcaId);
    List<Vehiculo> findByTipoVehiculoId(Long tipoId);

}