package com.grupodos.alquilervehiculos.msvcclientes.services;

import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteEmpresaRequestDto;
import com.grupodos.alquilervehiculos.msvcclientes.dto.ClienteNaturalRequestDto;
import com.grupodos.alquilervehiculos.msvcclientes.entities.Cliente;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteEmpresa;
import com.grupodos.alquilervehiculos.msvcclientes.entities.ClienteNatural;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClienteService<T, Dto> {
    List<T> listarTodos();
    T obtenerPorId(UUID id);
    T crear(Dto dto);
    T actualizar(UUID id, Dto dto);
    void eliminar(UUID id);
}
