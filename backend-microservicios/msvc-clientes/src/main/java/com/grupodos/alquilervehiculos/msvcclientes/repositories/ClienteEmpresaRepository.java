package com.grupodos.alquilervehiculos.msvcclientes.repositories;

import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClienteEmpresaRepository extends JpaRepository<ClienteEmpresa, UUID> {
    boolean existsByRuc(String ruc);
    boolean existsByRucAndIdNot(String ruc, UUID id);
}
