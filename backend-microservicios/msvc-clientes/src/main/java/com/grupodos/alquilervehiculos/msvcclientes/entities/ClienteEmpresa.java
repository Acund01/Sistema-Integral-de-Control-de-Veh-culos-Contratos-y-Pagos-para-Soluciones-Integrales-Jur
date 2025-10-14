package com.grupodos.alquilervehiculos.msvcclientes.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "clientes_empresas")
public class ClienteEmpresa extends Cliente {

    @Column(name = "razon_social")
    private String razonSocial;

    private String ruc;
    private String representante;

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
    public String getRepresentanteLegal() {
        return representante;
    }
    public void setRepresentanteLegal(String representanteLegal) {
        this.representante = representanteLegal;
    }

}
