package com.grupodos.alquilervehiculos.msvc_vehiculos.controllers;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.TipoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.services.TipoVehiculoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tipos")
public class TipoVehiculoController {

    private final TipoVehiculoService tipoVehiculoService;

    public TipoVehiculoController(TipoVehiculoService tipoVehiculoService) {
        this.tipoVehiculoService = tipoVehiculoService;
    }

    @GetMapping
    public List<TipoVehiculo> listar() {
        return tipoVehiculoService.listar();
    }

}
