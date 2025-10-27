package com.grupodos.alquilervehiculos.msvcclientes.repositories;

import com.grupodos.alquilervehiculos.msvcclientes.entities.Representante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RepresentanteRepository extends JpaRepository<Representante, UUID> {
    boolean existsByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumentoAndIdNot(String numeroDocumento, UUID id);
}
