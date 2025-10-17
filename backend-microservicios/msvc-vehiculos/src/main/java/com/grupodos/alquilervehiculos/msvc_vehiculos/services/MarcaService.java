package com.grupodos.alquilervehiculos.msvc_vehiculos.services;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.Marca;
import com.grupodos.alquilervehiculos.msvc_vehiculos.repositories.MarcaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public MarcaService(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    public List<Marca> listar() {
        return marcaRepository.findAll();
    }

    public Marca obtenerPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));
    }

    public Marca crear(Marca marca) {
        if(marcaRepository.existsByNombre(marca.getNombre())) {
            throw new RuntimeException("La marca ya existe");
        }
        return marcaRepository.save(marca);
    }

    public Marca actualizar(Long id, Marca marca) {
        Marca dbMarca = obtenerPorId(id);
        dbMarca.setNombre(marca.getNombre());
        return marcaRepository.save(dbMarca);
    }
}
