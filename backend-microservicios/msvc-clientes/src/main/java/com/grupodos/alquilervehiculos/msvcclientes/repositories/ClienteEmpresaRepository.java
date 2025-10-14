package com.grupodos.alquilervehiculos.msvcclientes.repositories;

import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClienteEmpresaRepository extends JpaRepository<ClienteEmpresa, UUID> {
    List<ClienteEmpresa> findByActivoTrue();
    Optional<ClienteEmpresa> findByIdAndActivoTrue(UUID id);
}
