package com.grupodos.alquilervehiculos.msvc_vehiculos.repositories;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModeloRepository extends JpaRepository<Modelo, Long> {
    List<Modelo> findByMarcaId(Long marcaId);
}
