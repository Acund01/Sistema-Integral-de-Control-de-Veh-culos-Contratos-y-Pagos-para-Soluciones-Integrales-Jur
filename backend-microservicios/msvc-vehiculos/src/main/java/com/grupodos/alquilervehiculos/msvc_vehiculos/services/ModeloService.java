package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.ModeloRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Marca;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.MarcaNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.ModeloNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.RecursoDuplicadoException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.MarcaRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.ModeloRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ModeloService {

    private final ModeloRepository modeloRepository;
    private final MarcaRepository marcaRepository;

    public List<Modelo> listarTodos() {
        log.debug("Listando todos los modelos");
        return modeloRepository.findAll();
    }

    public Modelo obtenerPorId(Long id) {
        log.debug("Obteniendo modelo con ID: {}", id);
        return modeloRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Modelo no encontrado con ID: {}", id);
                    return new ModeloNotFoundException(id);
                });
    }

    public List<Modelo> listarPorMarca(Long marcaId) {
        log.debug("Listando modelos por marca ID: {}", marcaId);
        return modeloRepository.findByMarcaId(marcaId);
    }

    public Modelo crearModelo(ModeloRequestDto dto) {
        log.info("Creando modelo: {}", dto.nombre());

        Marca marca = marcaRepository.findById(dto.marcaId())
                .orElseThrow(() -> new MarcaNotFoundException(dto.marcaId()));

        String nombreModelo = StringUtils.capitalize(StringUtils.trim(dto.nombre()));

        if (modeloRepository.existsByNombreAndMarcaId(nombreModelo, dto.marcaId())) {
            throw new RecursoDuplicadoException("El modelo '" + nombreModelo + "' ya existe para esta marca");
        }

        Modelo modelo = new Modelo();
        modelo.setNombre(nombreModelo);
        modelo.setMarca(marca);

        Modelo guardado = modeloRepository.save(modelo);
        log.info("Modelo creado exitosamente con ID: {}", guardado.getId());
        return guardado;
    }

    public Modelo actualizarModelo(Long id, ModeloRequestDto dto) {
        log.info("Actualizando modelo ID: {}", id);
        Modelo existente = obtenerPorId(id);
        Marca marca = marcaRepository.findById(dto.marcaId())
                .orElseThrow(() -> new MarcaNotFoundException(dto.marcaId()));

        String nombreModelo = StringUtils.capitalize(StringUtils.trim(dto.nombre()));

        if (!existente.getNombre().equals(nombreModelo) &&
                modeloRepository.existsByNombreAndMarcaId(nombreModelo, dto.marcaId())) {
            throw new RecursoDuplicadoException("El modelo '" + nombreModelo + "' ya existe para esta marca");
        }

        existente.setNombre(nombreModelo);
        existente.setMarca(marca);

        Modelo actualizado = modeloRepository.save(existente);
        log.info("Modelo actualizado exitosamente: {}", id);
        return actualizado;
    }
}
