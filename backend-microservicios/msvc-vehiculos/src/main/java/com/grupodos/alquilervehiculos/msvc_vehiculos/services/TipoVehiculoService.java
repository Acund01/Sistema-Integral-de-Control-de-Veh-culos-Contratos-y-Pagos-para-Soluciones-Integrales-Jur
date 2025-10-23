package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.TipoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.TipoVehiculoNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.TipoVehiculoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TipoVehiculoService {

    private final TipoVehiculoRepository tipoVehiculoRepository;

    public List<TipoVehiculo> listarTodos() {
        log.debug("Listando todos los tipos de vehículo");
        return tipoVehiculoRepository.findAll();
    }

    public TipoVehiculo obtenerPorId(Long id) {
        log.debug("Obteniendo tipo de vehículo con ID: {}", id);
        return tipoVehiculoRepository.findById(id)
                .orElseThrow(() -> new TipoVehiculoNotFoundException(id));
    }

    public Optional<TipoVehiculo> obtenerPorNombre(String nombre) {
        log.debug("Buscando tipo de vehículo por nombre: {}", nombre);
        return tipoVehiculoRepository.findByNombre(nombre);
    }
}
