package com.grupodos.alquilervehiculos.msvcreportes.clients;

import com.grupodos.alquilervehiculos.msvcreportes.dto.ClienteDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "msvc-clientes")
public interface ClienteFeignClient {

    @PostMapping("/api/clientes/reportes/por-ids")
    List<ClienteDto> obtenerClientesParaReportes(@RequestBody List<UUID> ids);

}
