package com.grupodos.alquilervehiculos.msvcreportes.repositories;

import com.grupodos.alquilervehiculos.msvcreportes.entities.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReporteRepository extends JpaRepository<Reporte, UUID> {
}
