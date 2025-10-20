package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.TipoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.TipoVehiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoVehiculoService {

    private final TipoVehiculoRepository tipoVehiculoRepository;

    public TipoVehiculoService(TipoVehiculoRepository tipoVehiculoRepository) {
        this.tipoVehiculoRepository = tipoVehiculoRepository;
    }

    public List<TipoVehiculo> listar() {
        return tipoVehiculoRepository.findAll();
    }
    public TipoVehiculo obtenerPorId(Long id) {
        return tipoVehiculoRepository.findById(id).orElse(null);
    }
}
