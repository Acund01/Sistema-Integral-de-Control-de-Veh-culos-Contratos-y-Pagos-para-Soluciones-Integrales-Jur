package com.grupodos.alquilervehiculos.msvc_contratos.repositories;

import com.grupodos.alquilervehiculos.msvc_contratos.entities.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ContratoRepository extends JpaRepository<Contrato, UUID> {
    @Query("SELECT MAX(CAST(SUBSTRING(c.codigoContrato, LENGTH(:prefix) + 1) AS long)) " +
            "FROM Contrato c WHERE c.codigoContrato LIKE :prefix%")
    Long findMaxNumeroContratoByYear(@Param("prefix") String prefix);

    default Long findMaxNumeroContratoByYear(int year) {
        String prefix = "CT-" + year + "-";
        return findMaxNumeroContratoByYear(prefix);
    }
}
