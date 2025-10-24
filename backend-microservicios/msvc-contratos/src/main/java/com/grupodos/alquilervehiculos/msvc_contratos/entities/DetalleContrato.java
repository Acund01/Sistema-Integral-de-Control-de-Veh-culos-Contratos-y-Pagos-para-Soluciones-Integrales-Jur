package com.grupodos.alquilervehiculos.msvc_contratos.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "detalles_contrato")
public class DetalleContrato {

    @Id
    @GeneratedValue
    @Column(name = "id_detalle", columnDefinition = "UUID DEFAULT gen_random_uuid()")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contrato", nullable = false)
    private Contrato contrato;

    @Column(name = "id_vehiculo", nullable = false)
    private UUID idVehiculo;

    @Column(name = "precio_diario", nullable = false)
    private Double precioDiario;

    @Column(name = "dias_alquiler", nullable = false)
    private Integer diasAlquiler;

    @Column(nullable = false)
    private Double subtotal;

    @Column(name = "placa_vehiculo", nullable = false, length = 10)
    private String placaVehiculo;

    @Column(name = "marca_vehiculo", nullable = false, length = 50)
    private String marcaVehiculo;

    @Column(name = "modelo_vehiculo", nullable = false, length = 50)
    private String modeloVehiculo;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    public DetalleContrato() {}

    public DetalleContrato(Contrato contrato, UUID idVehiculo, Double precioDiario,
                           Integer diasAlquiler, String placaVehiculo, String marcaVehiculo,
                           String modeloVehiculo) {
        this.contrato = contrato;
        this.idVehiculo = idVehiculo;
        this.precioDiario = precioDiario;
        this.diasAlquiler = diasAlquiler;
        this.placaVehiculo = placaVehiculo;
        this.marcaVehiculo = marcaVehiculo;
        this.modeloVehiculo = modeloVehiculo;
        this.subtotal = precioDiario * diasAlquiler;
    }

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Contrato getContrato() { return contrato; }
    public void setContrato(Contrato contrato) { this.contrato = contrato; }

    public UUID getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(UUID idVehiculo) { this.idVehiculo = idVehiculo; }

    public Double getPrecioDiario() { return precioDiario; }
    public void setPrecioDiario(Double precioDiario) {
        this.precioDiario = precioDiario;
        calcularSubtotal();
    }

    public Integer getDiasAlquiler() { return diasAlquiler; }
    public void setDiasAlquiler(Integer diasAlquiler) {
        this.diasAlquiler = diasAlquiler;
        calcularSubtotal();
    }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public String getPlacaVehiculo() { return placaVehiculo; }
    public void setPlacaVehiculo(String placaVehiculo) { this.placaVehiculo = placaVehiculo; }

    public String getMarcaVehiculo() { return marcaVehiculo; }
    public void setMarcaVehiculo(String marcaVehiculo) { this.marcaVehiculo = marcaVehiculo; }

    public String getModeloVehiculo() { return modeloVehiculo; }
    public void setModeloVehiculo(String modeloVehiculo) { this.modeloVehiculo = modeloVehiculo; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    private void calcularSubtotal() {
        if (this.precioDiario != null && this.diasAlquiler != null) {
            this.subtotal = this.precioDiario * this.diasAlquiler;
        }
    }

}
