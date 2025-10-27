package com.grupodos.alquilervehiculos.msvc_contratos.clients;

import com.grupodos.alquilervehiculos.msvc_contratos.dto.CambioEstadoVehDto;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.VehiculoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "msvc-vehiculos")
public interface VehiculoFeignClient {

    @GetMapping("/api/vehiculos/contratos/{id}")  // ← Cambiado al endpoint correcto
    VehiculoDto obtenerVehiculoPorId(@PathVariable UUID id);

    @PutMapping("/api/vehiculos/{id}/estado")
    void actualizarEstado(@PathVariable UUID id, @RequestBody CambioEstadoVehDto request);
}
