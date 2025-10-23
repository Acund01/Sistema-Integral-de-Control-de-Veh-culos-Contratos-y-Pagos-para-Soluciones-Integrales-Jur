package com.grupodos.alquilervehiculos.msvc_vehiculos.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "modelos")
@Getter
@Setter
@NoArgsConstructor
public class Modelo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modelo")
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_marca", nullable = false)
    private Marca marca;
}
