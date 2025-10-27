package com.grupodos.alquilervehiculos.msvc_contratos.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comprobantes")
@NoArgsConstructor
@Getter
@Setter
public class Comprobante {

    @Id
    @GeneratedValue
    @Column(name = "id_comprobante", columnDefinition = "UUID DEFAULT gen_random_uuid()")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contrato", nullable = false)
    private Contrato contrato;

    @CreationTimestamp
    @Column(name = "fecha_emision", updatable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "tipo_comprobante", nullable = false, length = 50)
    private String tipoComprobante; // FACTURA o BOLETA

    @Column(name = "numero_serie", nullable = false, length = 20)
    private String numeroSerie;

    @Column(name = "numero_correlativo", nullable = false, length = 20)
    private String numeroCorrelativo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal igv = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 20)
    private String estado = "GENERADO";

    public Comprobante(Contrato contrato, String tipoComprobante, String numeroSerie,
                       String numeroCorrelativo, BigDecimal subtotal, BigDecimal igv, BigDecimal total) {
        this.contrato = contrato;
        this.tipoComprobante = tipoComprobante;
        this.numeroSerie = numeroSerie;
        this.numeroCorrelativo = numeroCorrelativo;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
    }

}
