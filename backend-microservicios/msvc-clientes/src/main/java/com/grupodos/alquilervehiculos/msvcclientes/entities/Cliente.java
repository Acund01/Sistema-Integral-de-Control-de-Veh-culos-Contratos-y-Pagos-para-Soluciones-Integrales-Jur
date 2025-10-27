package com.grupodos.alquilervehiculos.msvcclientes.entities;

import com.grupodos.alquilervehiculos.msvcclientes.entities.enums.TipoCliente;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "clientes")
@Getter
@Setter
public abstract class Cliente {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cliente", nullable = false)
    private TipoCliente tipoCliente;

    @Column(unique = true)
    private String correo;

    @Column(nullable = false)
    private String telefono;

    private String direccion;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;

    @Column(nullable = false)
    private boolean activo;

}
