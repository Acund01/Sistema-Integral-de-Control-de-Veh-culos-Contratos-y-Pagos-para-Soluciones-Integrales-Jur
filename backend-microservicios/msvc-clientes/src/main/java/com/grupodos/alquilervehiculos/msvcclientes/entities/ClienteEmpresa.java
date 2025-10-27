package com.grupodos.alquilervehiculos.msvcclientes.entities;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@PrimaryKeyJoinColumn(name = "id")
@Table(name = "clientes_empresas")
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class ClienteEmpresa extends Cliente {

    @Column(name = "razon_social", nullable = false)
    private String razonSocial;

    @Column(nullable = false, unique = true, length = 20)
    private String ruc;

    @Column(name = "giro_comercial")
    private String giroComercial;

    @Column(name = "direccion_fiscal")
    private String direccionFiscal;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "representante_id", referencedColumnName = "id")
    private Representante representante;

}
