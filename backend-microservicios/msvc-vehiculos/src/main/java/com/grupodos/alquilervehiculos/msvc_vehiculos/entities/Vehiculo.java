package com.grupodos.alquilervehiculos.msvc_vehiculos.entities;

import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.EstadoVehiculo;
import com.grupodos.alquilervehiculos.msvc_vehiculos.entities.enums.TipoCombustible;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehiculos")
@Getter
@Setter
@NoArgsConstructor
public class Vehiculo {
    @Id
    @GeneratedValue
    @Column(name = "id_vehiculo")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String placa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_modelo", nullable = false)
    private Modelo modelo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoVehiculo tipoVehiculo;

    @Column(name = "anio_fabricacion")
    private Integer anioFabricacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCombustible combustible;

    @Column(nullable = false)
    private String descripcion;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoVehiculo estado;

    @Column(nullable = false)
    private boolean activo;
}
