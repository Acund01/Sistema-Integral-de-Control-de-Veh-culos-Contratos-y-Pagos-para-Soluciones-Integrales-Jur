package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.dto.MarcaConModelosRequestDto;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Marca;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Modelo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.MarcaNotFoundException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.exceptions.RecursoDuplicadoException;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.MarcaRepository;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.ModeloRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class MarcaService {

    private final MarcaRepository marcaRepository;
    private final ModeloRepository modeloRepository;

    public List<Marca> listarTodas() {
        log.debug("Listando todas las marcas");
        return marcaRepository.findAll();
    }

    public Marca obtenerPorId(Long id) {
        log.debug("Obteniendo marca con ID: {}", id);
        return marcaRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Marca no encontrada con ID: {}", id);
                    return new MarcaNotFoundException(id);
                });
    }

    public Marca crearMarcaConModelos(MarcaConModelosRequestDto dto) {
        log.info("Creando marca '{}' con {} modelos", dto.nombreMarca(), dto.modelos().size());

        if (StringUtils.isBlank(dto.nombreMarca())) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }

        String nombreMarca = StringUtils.capitalize(StringUtils.trim(dto.nombreMarca()));

        if (marcaRepository.existsByNombre(nombreMarca)) {
            log.warn("Intento de crear marca duplicada: {}", nombreMarca);
            throw new RecursoDuplicadoException("La marca '" + nombreMarca + "' ya existe");
        }

        Marca marca = new Marca();
        marca.setNombre(nombreMarca);
        Marca marcaGuardada = marcaRepository.save(marca);
        log.debug("Marca creada con ID: {}", marcaGuardada.getId());

        List<Modelo> modelosCreados = dto.modelos().stream()
                .map(nombreModelo -> {
                    String nombreModeloNormalizado = StringUtils.capitalize(StringUtils.trim(nombreModelo));

                    if (modeloRepository.existsByNombreAndMarcaId(nombreModeloNormalizado, marcaGuardada.getId())) {
                        log.warn("Modelo duplicado ignorado: {} para marca {}", nombreModeloNormalizado, nombreMarca);
                        return null;
                    }

                    Modelo modelo = new Modelo();
                    modelo.setNombre(nombreModeloNormalizado);
                    modelo.setMarca(marcaGuardada);
                    return modeloRepository.save(modelo);
                })
                .filter(Objects::nonNull)
                .toList();

        log.info("Marca '{}' creada exitosamente con {} modelos",
                marcaGuardada.getNombre(), modelosCreados.size());

        return marcaGuardada;
    }

    public Marca crearMarca(String nombre) {
        log.info("Creando marca: {}", nombre);

        if (StringUtils.isBlank(nombre)) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }

        String nombreNormalizado = StringUtils.capitalize(StringUtils.trim(nombre));

        if (marcaRepository.existsByNombre(nombreNormalizado)) {
            throw new RecursoDuplicadoException("La marca '" + nombreNormalizado + "' ya existe");
        }

        Marca marca = new Marca();
        marca.setNombre(nombreNormalizado);
        return marcaRepository.save(marca);
    }

    public Marca actualizarMarca(Long id, String nuevoNombre) {
        log.info("Actualizando marca ID: {} a '{}'", id, nuevoNombre);
        Marca marca = obtenerPorId(id);

        if (StringUtils.isBlank(nuevoNombre)) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }

        String nombreNormalizado = StringUtils.capitalize(StringUtils.trim(nuevoNombre));

        if (!marca.getNombre().equals(nombreNormalizado) &&
                marcaRepository.existsByNombre(nombreNormalizado)) {
            throw new RecursoDuplicadoException("La marca '" + nombreNormalizado + "' ya existe");
        }

        marca.setNombre(nombreNormalizado);
        return marcaRepository.save(marca);
    }
}
