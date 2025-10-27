package com.grupodos.alquilervehiculos.msvcclientes.repositories;

import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClienteNaturalRepository extends JpaRepository<ClienteNatural, UUID> {
    boolean existsByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumentoAndIdNot(String numeroDocumento, UUID id);
}
