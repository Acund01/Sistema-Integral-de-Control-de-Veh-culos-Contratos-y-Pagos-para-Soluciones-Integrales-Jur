package com.grupodos.alquilervehiculos.msvc_vehiculos.entities;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehiculos")
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

    @Column(nullable = false)
    private String combustible;

    @Column(nullable = false)
    private String descripcion;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;

    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private boolean activo;

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public String getPlaca() {
        return placa;
    }
    public void setPlaca(String placa) {
        this.placa = placa;
    }
    public Modelo getModelo() {
        return modelo;
    }
    public void setModelo(Modelo modelo) {
        this.modelo = modelo;
    }
    public TipoVehiculo getTipoVehiculo() {
        return tipoVehiculo;
    }
    public void setTipoVehiculo(TipoVehiculo tipoVehiculo) {
        this.tipoVehiculo = tipoVehiculo;
    }
    public Integer getAnioFabricacion() {
        return anioFabricacion;
    }
    public void setAnioFabricacion(Integer anioFabricacion) {
        this.anioFabricacion = anioFabricacion;
    }
    public String getCombustible() {
        return combustible;
    }
    public void setCombustible(String combustible) {
        this.combustible = combustible;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }
    public void setCreadoEn(OffsetDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }
    public boolean isActivo() {
        return activo;
    }
    public void setActivo(boolean activo) {
        this.activo = activo;
    }

}
