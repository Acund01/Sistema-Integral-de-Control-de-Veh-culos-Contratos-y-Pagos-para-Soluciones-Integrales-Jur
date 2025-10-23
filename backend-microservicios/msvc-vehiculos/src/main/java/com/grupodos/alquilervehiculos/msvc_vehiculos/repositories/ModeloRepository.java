package com.grupodos.alquilervehiculos.msvc_vehiculos.repositories;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModeloRepository extends JpaRepository<Modelo, Long> {
    List<Modelo> findByMarcaId(Long marcaId);
    boolean existsByNombreAndMarcaId(String nombre, Long marcaId);
}
