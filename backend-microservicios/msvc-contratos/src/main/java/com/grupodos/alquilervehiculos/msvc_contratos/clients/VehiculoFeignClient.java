package com.grupodos.alquilervehiculos.msvc_contratos.clients;

import com.grupodos.alquilervehiculos.msvc_contratos.dto.VehiculoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "msvc-vehiculos", url = "http://localhost:8083")
public interface VehiculoFeignClient {

    @GetMapping("/api/vehiculos/contratos/{id}")  // ← Cambiado al endpoint correcto
    VehiculoDto obtenerVehiculoPorId(@PathVariable UUID id);

    @PutMapping("/api/vehiculos/{id}/estado")     // ← Necesitas crear este endpoint
    void actualizarEstado(@PathVariable UUID id, @RequestParam String estado);
}
