package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.VehiculoRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.TipoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Vehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.ModeloRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.TipoVehiculoRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ModeloRepository modeloRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository,
                           ModeloRepository modeloRepository,
                           TipoVehiculoRepository tipoVehiculoRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.modeloRepository = modeloRepository;
        this.tipoVehiculoRepository = tipoVehiculoRepository;
    }

    public List<Vehiculo> listarTodos() {
        return vehiculoRepository.findAll();
    }
    public List<Vehiculo> listarPorMarca(Long marcaId) {
        return vehiculoRepository.findByModeloMarcaId(marcaId);
    }
    public List<Vehiculo> listarPorTipo(Long tipoId) {
        return vehiculoRepository.findByTipoVehiculoId(tipoId);
    }

    public Vehiculo obtenerPorId(UUID id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
    }

    public Vehiculo crearVehiculo(VehiculoRequestDto dto) {
        Modelo modelo = modeloRepository.findById(dto.modeloId())
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado"));
        TipoVehiculo tipo = tipoVehiculoRepository.findById(dto.tipoVehiculoId())
                .orElseThrow(() -> new RuntimeException("Tipo de vehículo no encontrado"));

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(dto.placa());
        vehiculo.setModelo(modelo);
        vehiculo.setTipoVehiculo(tipo);
        vehiculo.setAnioFabricacion(dto.anioFabricacion());
        vehiculo.setCombustible(dto.combustible());
        vehiculo.setDescripcion(dto.descripcion());
        vehiculo.setEstado(dto.estado());
        vehiculo.setActivo(dto.activo());
        vehiculo.setCreadoEn(OffsetDateTime.now());

        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo actualizarVehiculo(UUID id, VehiculoRequestDto dto) {
        Vehiculo existente = obtenerPorId(id);

        Modelo modelo = modeloRepository.findById(dto.modeloId())
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado"));
        TipoVehiculo tipo = tipoVehiculoRepository.findById(dto.tipoVehiculoId())
                .orElseThrow(() -> new RuntimeException("Tipo de vehículo no encontrado"));

        existente.setPlaca(dto.placa());
        existente.setModelo(modelo);
        existente.setTipoVehiculo(tipo);
        existente.setAnioFabricacion(dto.anioFabricacion());
        existente.setCombustible(dto.combustible());
        existente.setDescripcion(dto.descripcion());
        existente.setEstado(dto.estado());
        existente.setActivo(dto.activo());

        return vehiculoRepository.save(existente);
    }

    public void eliminarVehiculo(UUID id) {
        vehiculoRepository.deleteById(id);
    }


}
