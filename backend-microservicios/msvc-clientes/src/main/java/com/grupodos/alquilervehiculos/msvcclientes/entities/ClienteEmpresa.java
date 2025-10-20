package com.grupodos.alquilervehiculos.msvcclientes.entities;

import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "id")
@Table(name = "clientes_empresas")
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

    public String getRazonSocial() {
        return razonSocial;
    }
    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }
    public String getRuc() {
        return ruc;
    }
    public void setRuc(String ruc) {
        this.ruc = ruc;
    }
    public String getGiroComercial() {
        return giroComercial;
    }
    public void setGiroComercial(String giroComercial) {
        this.giroComercial = giroComercial;
    }
    public String getDireccionFiscal() {
        return direccionFiscal;
    }
    public void setDireccionFiscal(String direccionFiscal) {
        this.direccionFiscal = direccionFiscal;
    }
    public Representante getRepresentante() {
        return representante;
    }
    public void setRepresentante(Representante representante) {
        this.representante = representante;
    }

}
