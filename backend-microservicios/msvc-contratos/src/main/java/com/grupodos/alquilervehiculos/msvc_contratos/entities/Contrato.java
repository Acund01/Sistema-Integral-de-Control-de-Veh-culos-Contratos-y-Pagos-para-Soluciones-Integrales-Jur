package com.grupodos.alquilervehiculos.msvc_contratos.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "contratos")
public class Contrato {

    @Id
    @GeneratedValue
    @Column(name = "id_contrato", columnDefinition = "UUID DEFAULT gen_random_uuid()")
    private UUID id;

    @Column(name = "codigo_contrato", unique = true, nullable = false, length = 20)
    private String codigoContrato;

    @Column(name = "id_cliente", nullable = false)
    private UUID idCliente;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "dias_totales", nullable = false)
    private Integer diasTotales;

    @Column(name = "monto_total", nullable = false)
    private Double montoTotal;

    @Column(name = "estado", length = 20)
    private String estado = "ACTIVO";

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "creado_por", length = 100)
    private String creadoPor;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @OneToMany(mappedBy = "contrato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleContrato> detalles = new ArrayList<>();

    // Constructores
    public Contrato() {
        this.diasTotales = 0; // Valor por defecto
    }

    public Contrato(UUID idCliente, String codigoContrato, LocalDate fechaInicio,
                    LocalDate fechaFin, Double montoTotal, String estado) {
        this.idCliente = idCliente;
        this.codigoContrato = codigoContrato;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.montoTotal = montoTotal;
        this.estado = estado;
        this.diasTotales = calculateDiasTotales();
    }

    private Integer calculateDiasTotales() {
        if (fechaInicio == null || fechaFin == null) {
            return 0;
        }
        return (int) java.time.temporal.ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1;
    }

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCodigoContrato() { return codigoContrato; }
    public void setCodigoContrato(String codigoContrato) { this.codigoContrato = codigoContrato; }

    public UUID getIdCliente() { return idCliente; }
    public void setIdCliente(UUID idCliente) { this.idCliente = idCliente; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
        this.diasTotales = calculateDiasTotales();
    }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
        this.diasTotales = calculateDiasTotales();
    }

    public Integer getDiasTotales() {
        if (diasTotales == null) {
            this.diasTotales = calculateDiasTotales();
        }
        return diasTotales;
    }

    public void setDiasTotales(Integer diasTotales) {
        this.diasTotales = diasTotales;
    }

    public Double getMontoTotal() { return montoTotal; }
    public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }

    public List<DetalleContrato> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleContrato> detalles) { this.detalles = detalles; }
}
