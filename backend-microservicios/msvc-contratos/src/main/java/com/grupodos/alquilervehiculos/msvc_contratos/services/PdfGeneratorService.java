package com.grupodos.alquilervehiculos.msvc_contratos.services;

import com.grupodos.alquilervehiculos.msvc_contratos.clients.ClienteFeignClient;
import com.grupodos.alquilervehiculos.msvc_contratos.dto.ClienteDto;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.Comprobante;
import com.grupodos.alquilervehiculos.msvc_contratos.entities.DetalleContrato;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class PdfGeneratorService {

    private final ClienteFeignClient clienteFeignClient;

    public PdfGeneratorService(ClienteFeignClient clienteFeignClient) {
        this.clienteFeignClient = clienteFeignClient;
    }

    public byte[] generarComprobantePdf(Comprobante comprobante) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Configuración
                float margin = 50;
                float width = page.getMediaBox().getWidth() - 2 * margin;
                float yStart = page.getMediaBox().getHeight() - margin;
                float yPosition = yStart;

                // 1. ENCABEZADO
                yPosition = agregarEncabezado(contentStream, comprobante, margin, yPosition, width);
                yPosition -= 20;

                // 2. INFORMACIÓN DE LA EMPRESA
                yPosition = agregarInfoEmpresa(contentStream, margin, yPosition);
                yPosition -= 15;

                // 3. INFORMACIÓN DEL CLIENTE
                yPosition = agregarInfoCliente(contentStream, comprobante, margin, yPosition);
                yPosition -= 20;

                // 4. DETALLES DEL CONTRATO
                yPosition = agregarDetallesContrato(contentStream, comprobante, margin, yPosition);
                yPosition -= 20;

                // 5. TABLA DE VEHÍCULOS
                yPosition = agregarTablaVehiculos(contentStream, comprobante, margin, yPosition, width);
                yPosition -= 20;

                // 6. RESUMEN DE PAGOS
                yPosition = agregarResumenPagos(contentStream, comprobante, margin, yPosition, width);

                // 7. PIE DE PÁGINA
                agregarPiePagina(contentStream, margin, 50, width);

            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }

    private float agregarEncabezado(PDPageContentStream contentStream, Comprobante comprobante,
                                    float margin, float yPosition, float width) throws IOException {
        // Fondo color corporativo
        contentStream.setNonStrokingColor(41, 128, 185); // Azul
        contentStream.addRect(margin, yPosition - 30, width, 40);
        contentStream.fill();

        // Título en blanco
        contentStream.setNonStrokingColor(255, 255, 255);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 10, yPosition - 10);
        contentStream.showText("COMPROBANTE DE PAGO - " + comprobante.getTipoComprobante());
        contentStream.endText();

        // Número de comprobante
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + width - 100, yPosition - 10);
        contentStream.showText("N° " + comprobante.getNumeroSerie() + "-" + comprobante.getNumeroCorrelativo());
        contentStream.endText();

        return yPosition - 40;
    }

    private float agregarInfoEmpresa(PDPageContentStream contentStream, float margin, float yPosition) throws IOException {
        contentStream.setNonStrokingColor(0, 0, 0);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("EMPRESA DE ALQUILER DE VEHÍCULOS S.A.C.");
        contentStream.endText();

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition - 12);
        contentStream.showText("RUC: 20123456789");
        contentStream.newLineAtOffset(0, -12);
        contentStream.showText("Dirección: Av. Principal, La Joya, Arequipa");
        contentStream.newLineAtOffset(0, -12);
        contentStream.showText("Teléfono: (01) 123-4567");
        contentStream.newLineAtOffset(0, -12);
        contentStream.showText("Email: solucionesintegralesjuri@gmail.com");
        contentStream.endText();

        return yPosition - 60;
    }

    private float agregarInfoCliente(PDPageContentStream contentStream, Comprobante comprobante,
                                     float margin, float yPosition) throws IOException {
        // Obtener información REAL del cliente
        ClienteDto cliente = obtenerCliente(comprobante.getContrato().getIdCliente());

        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("INFORMACIÓN DEL CLIENTE");
        contentStream.endText();

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition - 12);

        if ("EMPRESA".equals(cliente.tipoCliente())) {
            contentStream.showText("Razón Social: " + cliente.razonSocial());
            contentStream.newLineAtOffset(0, -12);
            contentStream.showText("RUC: " + cliente.ruc());
            if (cliente.representante() != null) {
                contentStream.newLineAtOffset(0, -12);
                contentStream.showText("Representante: " + cliente.representante().nombre() + " " + cliente.representante().apellido());
                contentStream.newLineAtOffset(0, -12);
                contentStream.showText("Documento: " + cliente.representante().tipoDocumento() + " " + cliente.representante().numeroDocumento());
            }
        } else {
            // muestra tipo de documento y número
            contentStream.showText("Cliente: " + cliente.nombre() + " " + cliente.apellido());
            contentStream.newLineAtOffset(0, -12);
            contentStream.showText("Documento: " + cliente.tipoDocumento() + " " + cliente.numeroDocumento());
            contentStream.newLineAtOffset(0, -12);
            contentStream.showText("Tipo: Persona Natural");
        }

        contentStream.endText();

        return yPosition - ("EMPRESA".equals(cliente.tipoCliente()) ? 60 : 50);
    }

    private float agregarDetallesContrato(PDPageContentStream contentStream, Comprobante comprobante,
                                          float margin, float yPosition) throws IOException {
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("DETALLES DEL CONTRATO");
        contentStream.endText();

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition - 12);
        contentStream.showText("Contrato: " + comprobante.getContrato().getCodigoContrato());
        contentStream.newLineAtOffset(0, -12);
        contentStream.showText("Fecha Emisión: " +
                comprobante.getFechaEmision().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        contentStream.newLineAtOffset(0, -12);
        contentStream.showText("Período Alquiler: " +
                comprobante.getContrato().getFechaInicio() + " al " +
                comprobante.getContrato().getFechaFin() + " (" +
                comprobante.getContrato().getDiasTotales() + " días)");
        contentStream.endText();

        return yPosition - 50;
    }

    private float agregarTablaVehiculos(PDPageContentStream contentStream, Comprobante comprobante,
                                        float margin, float yPosition, float width) throws IOException {
        // Encabezado de tabla
        contentStream.setNonStrokingColor(240, 240, 240); // Gris claro
        contentStream.addRect(margin, yPosition - 15, width, 20);
        contentStream.fill();

        contentStream.setStrokingColor(0, 0, 0);
        contentStream.setLineWidth(0.5f);
        contentStream.addRect(margin, yPosition - 15, width, 20);
        contentStream.stroke();

        // Columnas
        String[] headers = {"Vehículo", "Placa", "Días", "Precio/Día", "Subtotal"};
        float[] columnWidths = {width * 0.35f, width * 0.15f, width * 0.1f, width * 0.2f, width * 0.2f};

        contentStream.setNonStrokingColor(0, 0, 0);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 9);

        float xPosition = margin + 5;
        for (int i = 0; i < headers.length; i++) {
            contentStream.beginText();
            contentStream.newLineAtOffset(xPosition, yPosition - 10);
            contentStream.showText(headers[i]);
            contentStream.endText();
            xPosition += columnWidths[i];
        }

        yPosition -= 25;

        // Filas de vehículos
        contentStream.setFont(PDType1Font.HELVETICA, 8);
        for (DetalleContrato detalle : comprobante.getContrato().getDetalles()) {
            if (yPosition < 100) {
                // Aquí podrías agregar una nueva página si es necesario
                break;
            }

            String vehiculoInfo = detalle.getMarcaVehiculo() + " " + detalle.getModeloVehiculo();
            String[] rowData = {
                    vehiculoInfo,
                    detalle.getPlacaVehiculo(),
                    detalle.getDiasAlquiler().toString(),
                    "S/ " + String.format("%.2f", detalle.getPrecioDiario()),
                    "S/ " + String.format("%.2f", detalle.getSubtotal())
            };

            xPosition = margin + 5;
            for (int i = 0; i < rowData.length; i++) {
                contentStream.beginText();
                contentStream.newLineAtOffset(xPosition, yPosition);
                contentStream.showText(rowData[i]);
                contentStream.endText();
                xPosition += columnWidths[i];
            }

            // Línea separadora
            contentStream.moveTo(margin, yPosition - 5);
            contentStream.lineTo(margin + width, yPosition - 5);
            contentStream.stroke();

            yPosition -= 15;
        }

        return yPosition;
    }

    private float agregarResumenPagos(PDPageContentStream contentStream, Comprobante comprobante,
                                      float margin, float yPosition, float width) throws IOException {
        float boxWidth = width * 0.4f;
        float boxX = margin + width - boxWidth;

        // Caja de resumen
        contentStream.setNonStrokingColor(250, 250, 250);
        contentStream.addRect(boxX, yPosition - 80, boxWidth, 70);
        contentStream.fill();

        contentStream.setStrokingColor(0, 0, 0);
        contentStream.addRect(boxX, yPosition - 80, boxWidth, 70);
        contentStream.stroke();

        contentStream.setNonStrokingColor(0, 0, 0);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(boxX + 10, yPosition - 25);
        contentStream.showText("RESUMEN DE PAGOS");
        contentStream.endText();

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(boxX + 10, yPosition - 40);
        contentStream.showText("Subtotal: S/ " + String.format("%.2f", comprobante.getSubtotal()));
        contentStream.newLineAtOffset(0, -12);
        contentStream.showText("IGV (18%): S/ " + String.format("%.2f", comprobante.getIgv()));
        contentStream.newLineAtOffset(0, -12);

        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 11);
        contentStream.showText("TOTAL: S/ " + String.format("%.2f", comprobante.getTotal()));
        contentStream.endText();

        return yPosition - 90;
    }

    private void agregarPiePagina(PDPageContentStream contentStream, float margin, float yPosition, float width) throws IOException {
        contentStream.setNonStrokingColor(100, 100, 100);
        contentStream.setFont(PDType1Font.HELVETICA_OBLIQUE, 8);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("¡Gracias por su preferencia!");
        contentStream.newLineAtOffset(0, -10);
        contentStream.showText("Este es un comprobante electrónico generado automáticamente.");
        contentStream.endText();

        // Línea separadora
        contentStream.setStrokingColor(200, 200, 200);
        contentStream.setLineWidth(1f);
        contentStream.moveTo(margin, yPosition + 10);
        contentStream.lineTo(margin + width, yPosition + 10);
        contentStream.stroke();
    }

    private ClienteDto obtenerCliente(UUID clienteId) {
        try {
            // USANDO EL FEIGN CLIENT REAL
            return clienteFeignClient.obtenerClientePorId(clienteId);
        } catch (Exception e) {
            // Fallback en caso de error
            System.err.println("Error obteniendo cliente: " + e.getMessage());
            return new ClienteDto(
                    clienteId, "NATURAL", "Cliente", "No Encontrado",
                    "DNI", "00000000", null, null, null
            );
        }
    }
}
