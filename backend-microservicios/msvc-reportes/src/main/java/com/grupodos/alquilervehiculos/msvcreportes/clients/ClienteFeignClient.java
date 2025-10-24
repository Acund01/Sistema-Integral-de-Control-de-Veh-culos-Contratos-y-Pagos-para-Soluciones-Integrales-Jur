package com.grupodos.alquilervehiculos.msvcreportes.clients;

import com.grupodos.alquilervehiculos.msvcreportes.dto.ClienteDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "msvc-clientes", url = "http://localhost:8082")
public interface ClienteFeignClient {

    @GetMapping("/api/clientes")
    List<ClienteDto> obtenerTodosClientes();

    @GetMapping("/api/clientes/{id}")
    ClienteDto obtenerClientePorId(@PathVariable UUID id);

    @GetMapping("/api/clientes/activos")
    List<ClienteDto> obtenerClientesActivos();
}
