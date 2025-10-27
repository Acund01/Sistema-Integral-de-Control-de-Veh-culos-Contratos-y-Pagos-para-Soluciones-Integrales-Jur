package com.grupodos.alquilervehiculos.msvcclientes.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "representantes")
@Getter
@Setter
public class Representante {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(name = "tipo_documento", nullable = false)
    private String tipoDocumento; // DNI / CE / Pasaporte

    @Column(name = "numero_documento", nullable = false, unique = true)
    private String numeroDocumento;

    @Column
    private String cargo;

    @Column
    private String correo;

    @Column
    private String telefono;

}
