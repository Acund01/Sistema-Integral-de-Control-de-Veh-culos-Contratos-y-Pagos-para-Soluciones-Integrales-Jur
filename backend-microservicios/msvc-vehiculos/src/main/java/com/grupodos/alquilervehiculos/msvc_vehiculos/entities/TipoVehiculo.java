package com.grupodos.alquilervehiculos.msvc_vehiculos.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_vehiculos")
@Getter
@Setter
@NoArgsConstructor
public class TipoVehiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Integer id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;
}
