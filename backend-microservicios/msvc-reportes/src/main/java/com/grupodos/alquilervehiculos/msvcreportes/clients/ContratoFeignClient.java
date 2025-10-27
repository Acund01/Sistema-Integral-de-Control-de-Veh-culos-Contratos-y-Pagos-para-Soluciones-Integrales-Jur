package com.grupodos.alquilervehiculos.msvcreportes.clients;

import com.grupodos.alquilervehiculos.msvcreportes.dto.ComprobanteDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ContratoDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ContratoPagoDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.RangoFechasRequest;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@FeignClient(name = "msvc-contratos")
public interface ContratoFeignClient {

    @GetMapping("/api/contratos")
    List<ContratoDto> obtenerTodosContratos();

    @PostMapping("/api/contratos/rango-fechas")
    List<ContratoDto> obtenerContratosPorRangoFechas(@RequestBody RangoFechasRequest request);

    @PostMapping("/api/contratos/rango-fechas")
    List<ContratoPagoDto> obtenerContratosPorRangoFechasPago(@RequestBody RangoFechasRequest request);

    @PostMapping("/api/comprobantes/rango-fechas")
        List<ComprobanteDto> obtenerComprobantesPorRangoFechas(
            @Valid @RequestBody RangoFechasRequest request
    );
}
