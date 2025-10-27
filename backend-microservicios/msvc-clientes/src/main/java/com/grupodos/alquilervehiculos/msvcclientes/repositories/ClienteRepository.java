package com.grupodos.alquilervehiculos.msvcclientes.repositories;

import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
    List<Cliente> findByActivoTrue();
    List<Cliente> findByActivoFalse();
    boolean existsByCorreo(String correo);
    boolean existsByCorreoAndIdNot(String correo, UUID id);
}
