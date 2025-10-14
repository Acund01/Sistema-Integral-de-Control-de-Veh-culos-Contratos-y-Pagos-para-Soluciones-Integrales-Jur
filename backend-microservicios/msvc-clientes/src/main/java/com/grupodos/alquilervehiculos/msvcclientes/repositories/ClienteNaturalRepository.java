package com.grupodos.alquilervehiculos.msvcclientes.repositories;

import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClienteNaturalRepository extends JpaRepository<ClienteNatural, UUID> {
    List<ClienteNatural> findByActivoTrue();
    Optional<ClienteNatural> findByIdAndActivoTrue(UUID id);
}
