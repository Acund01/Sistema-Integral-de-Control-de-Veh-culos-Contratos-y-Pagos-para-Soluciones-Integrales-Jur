package com.grupodos.alquilervehiculos.msvcclientes.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@PrimaryKeyJoinColumn(name = "id")
@Table(name = "clientes_naturales")
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class ClienteNatural extends Cliente{

    @Column(name = "tipo_documento", nullable = false, length = 30)
    private String tipoDocumento; // Ej: "DNI", "CE", "PASAPORTE"

    @Column(nullable = false, unique = true, length = 20)
    private String numeroDocumento;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

}
