package com.grupodos.alquilervehiculos.msvcreportes.clients;

import com.grupodos.alquilervehiculos.msvcreportes.dto.VehiculoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "msvc-vehiculos", url = "http://localhost:8083")
public interface VehiculoFeignClient {

    @GetMapping("/api/vehiculos/para-reportes")
    List<VehiculoDto> obtenerVehiculosParaReportes();

}
