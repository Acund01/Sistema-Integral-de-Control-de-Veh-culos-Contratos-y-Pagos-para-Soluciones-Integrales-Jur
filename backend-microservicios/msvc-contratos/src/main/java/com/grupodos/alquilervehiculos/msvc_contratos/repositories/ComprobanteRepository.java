package com.grupodos.alquilervehiculos.msvc_contratos.repositories;

import com.grupodos.alquilervehiculos.msvc_contratos.entities.Comprobante;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ComprobanteRepository extends CrudRepository<Comprobante, UUID> {
    Optional<Comprobante> findByContratoId(UUID contratoId);

    @Query("SELECT MAX(c.numeroCorrelativo) FROM Comprobante c WHERE c.numeroSerie = :serie")
    String findMaxCorrelativoBySerie(@Param("serie") String serie);

    boolean existsByNumeroSerieAndNumeroCorrelativo(String numeroSerie, String numeroCorrelativo);
}
