package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.ModeloRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Marca;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.MarcaRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.ModeloRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModeloService {

    private final ModeloRepository modeloRepository;
    private final MarcaRepository marcaRepository;

    public ModeloService(ModeloRepository modeloRepository, MarcaRepository marcaRepository) {
        this.modeloRepository = modeloRepository;
        this.marcaRepository = marcaRepository;
    }

    public List<Modelo> listarTodos() {
        return modeloRepository.findAll();
    }

    public Modelo obtenerPorId(Long id) {
        return modeloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado"));
    }

    public List<Modelo> listarPorMarca(Long marcaId) {
        return modeloRepository.findByMarcaId(marcaId);
    }

    public Modelo crear(ModeloRequestDto dto) {
        Marca marca = marcaRepository.findById(dto.marcaId())
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

        Modelo modelo = new Modelo();
        modelo.setNombre(dto.nombre());
        modelo.setMarca(marca);

        return modeloRepository.save(modelo);
    }

    public Modelo actualizar(Long id, ModeloRequestDto dto) {
        Modelo existente = obtenerPorId(id);
        Marca marca = marcaRepository.findById(dto.marcaId())
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

        existente.setNombre(dto.nombre());
        existente.setMarca(marca);

        return modeloRepository.save(existente);
    }

}
