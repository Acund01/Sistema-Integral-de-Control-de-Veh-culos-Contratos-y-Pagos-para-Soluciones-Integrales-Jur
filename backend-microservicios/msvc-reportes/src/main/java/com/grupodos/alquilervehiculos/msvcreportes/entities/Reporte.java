package com.grupodos.alquilervehiculos.msvcreportes.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reportes_generados")
public class Reporte {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String tipoReporte;

    @Column(nullable = false)
    private String formato;

    @Column(nullable = false)
    private String nombreArchivo;

    @Column(nullable = false)
    private LocalDateTime fechaGeneracion;

    @Column(nullable = false)
    private String generadoPor;

    @Column
    private String parametros;

    @Column
    private Long tamañoBytes;
}
