package com.grupodos.alquilervehiculos.msvcreportes.services;

import com.grupodos.alquilervehiculos.msvcreportes.dto.ReporteIngresosDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ReportePagosDto;
import com.grupodos.alquilervehiculos.msvcreportes.dto.ReporteUsoVehiculosDto;
import com.grupodos.alquilervehiculos.msvcreportes.exceptions.ReporteGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class ExcelGeneratorService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMMM yyyy", java.util.Locale.forLanguageTag("es"));

    public byte[] generarReportePagosExcel(List<ReportePagosDto> pagos, String titulo) throws IOException {
        log.debug("Generando reporte de pagos en Excel con {} registros", pagos.size());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Reporte de Pagos");

            // Crear estilos
            CellStyle headerStyle = crearEstiloHeader(workbook);
            CellStyle currencyStyle = crearEstiloMoneda(workbook);
            CellStyle dateStyle = crearEstiloFecha(workbook);
            CellStyle titleStyle = crearEstiloTitulo(workbook);
            CellStyle totalStyle = crearEstiloTotal(workbook);
            CellStyle subtitleStyle = crearEstiloSubtitulo(workbook);

            int currentRow = 0;

            // Título principal
            currentRow = agregarTituloPrincipal(sheet, titleStyle, titulo, 11, currentRow);

            // Subtítulo con información del reporte
            currentRow = agregarSubtitulo(sheet, subtitleStyle,
                    String.format("Total de registros: %d | Fecha de generación: %s",
                            pagos.size(), java.time.LocalDateTime.now().format(DATE_TIME_FORMATTER)),
                    11, currentRow);

            currentRow++; // Espacio

            // Encabezados
            currentRow = crearHeader(sheet, headerStyle, new String[]{
                    "N° Comprobante", "Fecha Emisión", "Tipo", "Cliente",
                    "Documento", "Tipo Cliente", "Subtotal", "IGV", "Total", "Estado", "Contrato"
            }, currentRow);

            // Datos
            BigDecimal subtotalGeneral = BigDecimal.ZERO;
            BigDecimal igvGeneral = BigDecimal.ZERO;
            BigDecimal totalGeneral = BigDecimal.ZERO;

            int startDataRow = currentRow;

            for (ReportePagosDto pago : pagos) {
                Row row = sheet.createRow(currentRow++);

                // N° Comprobante
                cellSegura(row, 0, pago.numeroComprobante());

                // Fecha Emisión
                Cell fechaCell = row.createCell(1);
                if (pago.fechaEmision() != null) {
                    fechaCell.setCellValue(pago.fechaEmision().format(DATE_TIME_FORMATTER));
                    fechaCell.setCellStyle(dateStyle);
                } else {
                    cellSegura(row, 1, "N/A");
                }

                cellSegura(row, 2, pago.tipoComprobante());
                cellSegura(row, 3, pago.cliente());
                cellSegura(row, 4, pago.documentoCliente());
                cellSegura(row, 5, pago.tipoCliente());

                // Subtotal
                Cell subtotalCell = row.createCell(6);
                double subtotalValor = pago.subtotal() != null ? pago.subtotal().doubleValue() : 0.0;
                subtotalCell.setCellValue(subtotalValor);
                subtotalCell.setCellStyle(currencyStyle);
                if (pago.subtotal() != null) subtotalGeneral = subtotalGeneral.add(pago.subtotal());

                // IGV
                Cell igvCell = row.createCell(7);
                double igvValor = pago.igv() != null ? pago.igv().doubleValue() : 0.0;
                igvCell.setCellValue(igvValor);
                igvCell.setCellStyle(currencyStyle);
                if (pago.igv() != null) igvGeneral = igvGeneral.add(pago.igv());

                // Total
                Cell totalCell = row.createCell(8);
                double totalValor = pago.total() != null ? pago.total().doubleValue() : 0.0;
                totalCell.setCellValue(totalValor);
                totalCell.setCellStyle(currencyStyle);
                if (pago.total() != null) totalGeneral = totalGeneral.add(pago.total());

                cellSegura(row, 9, pago.estadoComprobante());
                cellSegura(row, 10, pago.codigoContrato());
            }

            // Totales generales
            currentRow = agregarTotalesPagos(sheet, totalStyle, currencyStyle,
                    subtotalGeneral, igvGeneral, totalGeneral, currentRow, 11);

            // Autoajustar columnas
            for (int i = 0; i < 11; i++) {
                sheet.autoSizeColumn(i);
            }

            // Congelar paneles (título y encabezados)
            sheet.createFreezePane(0, startDataRow);

            workbook.write(baos);
            log.debug("Excel de pagos generado exitosamente");
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error de E/S generando Excel de pagos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error generando archivo Excel de pagos", e);
        } catch (Exception e) {
            log.error("Error generando Excel de pagos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error inesperado generando reporte de pagos", e);
        }
    }

    public byte[] generarReporteUsoVehiculosExcel(List<ReporteUsoVehiculosDto> usoVehiculos, String titulo) throws IOException {
        log.debug("Generando reporte de uso de vehículos en Excel con {} registros", usoVehiculos.size());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Uso de Vehículos");

            CellStyle headerStyle = crearEstiloHeader(workbook);
            CellStyle currencyStyle = crearEstiloMoneda(workbook);
            CellStyle percentStyle = crearEstiloPorcentaje(workbook);
            CellStyle dateStyle = crearEstiloFecha(workbook);
            CellStyle titleStyle = crearEstiloTitulo(workbook);
            CellStyle totalStyle = crearEstiloTotal(workbook);
            CellStyle subtitleStyle = crearEstiloSubtitulo(workbook);

            int currentRow = 0;

            // Título principal
            currentRow = agregarTituloPrincipal(sheet, titleStyle, titulo, 9, currentRow);

            // Subtítulo
            currentRow = agregarSubtitulo(sheet, subtitleStyle,
                    String.format("Total de vehículos: %d | Fecha de generación: %s",
                            usoVehiculos.size(), java.time.LocalDateTime.now().format(DATE_TIME_FORMATTER)),
                    9, currentRow);

            currentRow++;

            // Encabezados
            currentRow = crearHeader(sheet, headerStyle, new String[]{
                    "Placa", "Marca", "Modelo", "Tipo", "Días Alquilados",
                    "Cantidad Contratos", "Total Recaudado", "% Uso", "Último Alquiler"
            }, currentRow);

            // Datos
            BigDecimal totalRecaudadoGeneral = BigDecimal.ZERO;
            int totalDiasAlquilados = 0;
            int totalContratos = 0;

            int startDataRow = currentRow;

            for (ReporteUsoVehiculosDto uso : usoVehiculos) {
                Row row = sheet.createRow(currentRow++);

                cellSegura(row, 0, uso.placa());
                cellSegura(row, 1, uso.marca());
                cellSegura(row, 2, uso.modelo());
                cellSegura(row, 3, uso.tipoVehiculo());

                // Días Alquilados
                cellSegura(row, 4, uso.totalDiasAlquilados() != null ? uso.totalDiasAlquilados() : 0);
                if (uso.totalDiasAlquilados() != null) totalDiasAlquilados += uso.totalDiasAlquilados();

                // Cantidad Contratos
                cellSegura(row, 5, uso.cantidadContratos() != null ? uso.cantidadContratos() : 0);
                if (uso.cantidadContratos() != null) totalContratos += uso.cantidadContratos();

                // Total Recaudado
                Cell totalCell = row.createCell(6);
                double totalValor = uso.totalRecaudado() != null ? uso.totalRecaudado().doubleValue() : 0.0;
                totalCell.setCellValue(totalValor);
                totalCell.setCellStyle(currencyStyle);
                if (uso.totalRecaudado() != null) totalRecaudadoGeneral = totalRecaudadoGeneral.add(uso.totalRecaudado());

                // % Uso
                Cell percentCell = row.createCell(7);
                double percentValor = uso.porcentajeUso() != null ? uso.porcentajeUso() / 100.0 : 0.0;
                percentCell.setCellValue(percentValor);
                percentCell.setCellStyle(percentStyle);

                // Último Alquiler
                if (uso.ultimoAlquiler() != null) {
                    Cell fechaCell = row.createCell(8);
                    fechaCell.setCellValue(uso.ultimoAlquiler().format(DATE_FORMATTER));
                    fechaCell.setCellStyle(dateStyle);
                } else {
                    cellSegura(row, 8, "N/A");
                }
            }

            // Totales generales
            currentRow = agregarTotalesUsoVehiculos(sheet, totalStyle, currencyStyle,
                    totalRecaudadoGeneral, totalDiasAlquilados, totalContratos, currentRow, 9);

            // Autoajustar columnas
            for (int i = 0; i < 9; i++) {
                sheet.autoSizeColumn(i);
            }

            sheet.createFreezePane(0, startDataRow);

            workbook.write(baos);
            log.debug("Excel de uso de vehículos generado exitosamente");
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error de E/S generando Excel de uso de vehículos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error generando archivo Excel de uso de vehículos", e);
        } catch (Exception e) {
            log.error("Error generando Excel de uso de vehículos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error inesperado generando reporte de uso de vehículos", e);
        }
    }

    public byte[] generarReporteIngresosExcel(List<ReporteIngresosDto> ingresos, String titulo) throws IOException {
        log.debug("Generando reporte de ingresos en Excel con {} registros", ingresos.size());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ingresos Mensuales");

            CellStyle headerStyle = crearEstiloHeader(workbook);
            CellStyle currencyStyle = crearEstiloMoneda(workbook);
            CellStyle titleStyle = crearEstiloTitulo(workbook);
            CellStyle totalStyle = crearEstiloTotal(workbook);
            CellStyle subtitleStyle = crearEstiloSubtitulo(workbook);
            CellStyle monthStyle = crearEstiloMes(workbook);

            int currentRow = 0;

            // Título principal
            currentRow = agregarTituloPrincipal(sheet, titleStyle, titulo, 7, currentRow);

            // Subtítulo
            currentRow = agregarSubtitulo(sheet, subtitleStyle,
                    String.format("Período analizado: %d meses | Fecha de generación: %s",
                            ingresos.size(), java.time.LocalDateTime.now().format(DATE_TIME_FORMATTER)),
                    7, currentRow);

            currentRow++;

            // Encabezados
            currentRow = crearHeader(sheet, headerStyle, new String[]{
                    "Mes", "Total Contratos", "Total Ingresos", "Promedio por Contrato",
                    "IGV Recaudado", "Clientes Atendidos", "Vehículos Utilizados"
            }, currentRow);

            // Datos
            BigDecimal totalIngresosGeneral = BigDecimal.ZERO;
            BigDecimal totalIgvGeneral = BigDecimal.ZERO;
            int totalContratosGeneral = 0;
            int totalClientesGeneral = 0;
            int totalVehiculosGeneral = 0;

            int startDataRow = currentRow;

            for (ReporteIngresosDto ingreso : ingresos) {
                Row row = sheet.createRow(currentRow++);

                // Mes con formato en español
                Cell mesCell = row.createCell(0);
                if (ingreso.mes() != null) {
                    String mesFormateado = ingreso.mes().format(MONTH_FORMATTER);
                    // Capitalizar primera letra
                    mesFormateado = mesFormateado.substring(0, 1).toUpperCase() + mesFormateado.substring(1);
                    mesCell.setCellValue(mesFormateado);
                } else {
                    mesCell.setCellValue("N/A");
                }
                mesCell.setCellStyle(monthStyle);

                // Total Contratos
                cellSegura(row, 1, ingreso.totalContratos() != null ? ingreso.totalContratos() : 0);
                if (ingreso.totalContratos() != null) totalContratosGeneral += ingreso.totalContratos();

                // Total Ingresos
                Cell ingresosCell = row.createCell(2);
                double ingresosValor = ingreso.totalIngresos() != null ? ingreso.totalIngresos().doubleValue() : 0.0;
                ingresosCell.setCellValue(ingresosValor);
                ingresosCell.setCellStyle(currencyStyle);
                if (ingreso.totalIngresos() != null) totalIngresosGeneral = totalIngresosGeneral.add(ingreso.totalIngresos());

                // Promedio por Contrato
                Cell promedioCell = row.createCell(3);
                double promedioValor = ingreso.promedioPorContrato() != null ? ingreso.promedioPorContrato().doubleValue() : 0.0;
                promedioCell.setCellValue(promedioValor);
                promedioCell.setCellStyle(currencyStyle);

                // IGV Recaudado
                Cell igvCell = row.createCell(4);
                double igvValor = ingreso.igvRecaudado() != null ? ingreso.igvRecaudado().doubleValue() : 0.0;
                igvCell.setCellValue(igvValor);
                igvCell.setCellStyle(currencyStyle);
                if (ingreso.igvRecaudado() != null) totalIgvGeneral = totalIgvGeneral.add(ingreso.igvRecaudado());

                // Clientes Atendidos
                cellSegura(row, 5, ingreso.cantidadClientes() != null ? ingreso.cantidadClientes() : 0);
                if (ingreso.cantidadClientes() != null) totalClientesGeneral += ingreso.cantidadClientes();

                // Vehículos Utilizados
                cellSegura(row, 6, ingreso.cantidadVehiculosUtilizados() != null ? ingreso.cantidadVehiculosUtilizados() : 0);
                if (ingreso.cantidadVehiculosUtilizados() != null) totalVehiculosGeneral += ingreso.cantidadVehiculosUtilizados();
            }

            // Totales generales
            currentRow = agregarTotalesIngresos(sheet, totalStyle, currencyStyle,
                    totalIngresosGeneral, totalIgvGeneral, totalContratosGeneral,
                    totalClientesGeneral, totalVehiculosGeneral, currentRow, 7);

            // Autoajustar columnas
            for (int i = 0; i < 7; i++) {
                sheet.autoSizeColumn(i);
            }

            sheet.createFreezePane(0, startDataRow);

            workbook.write(baos);
            log.debug("Excel de ingresos generado exitosamente");
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error de E/S generando Excel de ingresos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error generando archivo Excel de ingresos", e);
        } catch (Exception e) {
            log.error("Error generando Excel de ingresos: {}", e.getMessage(), e);
            throw new ReporteGenerationException("Error inesperado generando reporte de ingresos", e);
        }
    }

    // Metodos auxiliares
    private CellStyle crearEstiloHeader(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
        return style;
    }

    private CellStyle crearEstiloTitulo(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloSubtitulo(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloTotal(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.DOUBLE);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle crearEstiloMoneda(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("S/ #,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle crearEstiloPorcentaje(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle crearEstiloFecha(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy hh:mm AM/PM"));
        return style;
    }

    private CellStyle crearEstiloMes(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private int agregarTituloPrincipal(Sheet sheet, CellStyle style, String titulo, int numColumns, int rowNum) {
        Row titleRow = sheet.createRow(rowNum);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(titulo);
        titleCell.setCellStyle(style);

        if (numColumns > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, 0, numColumns - 1));
        }

        return rowNum + 1;
    }

    private int agregarSubtitulo(Sheet sheet, CellStyle style, String subtitulo, int numColumns, int rowNum) {
        Row subtitleRow = sheet.createRow(rowNum);
        Cell subtitleCell = subtitleRow.createCell(0);
        subtitleCell.setCellValue(subtitulo);
        subtitleCell.setCellStyle(style);

        if (numColumns > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, 0, numColumns - 1));
        }

        return rowNum + 1;
    }

    private int crearHeader(Sheet sheet, CellStyle style, String[] headers, int rowNum) {
        Row headerRow = sheet.createRow(rowNum);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
        return rowNum + 1;
    }

    private int agregarTotalesPagos(Sheet sheet, CellStyle totalStyle, CellStyle currencyStyle,
                                    BigDecimal subtotal, BigDecimal igv, BigDecimal total, int rowNum, int numColumns) {
        Row totalRow = sheet.createRow(rowNum++);

        // Celda de "TOTALES GENERALES"
        Cell labelCell = totalRow.createCell(5);
        labelCell.setCellValue("TOTALES GENERALES:");
        labelCell.setCellStyle(totalStyle);

        // Subtotal
        Cell subtotalCell = totalRow.createCell(6);
        subtotalCell.setCellValue(subtotal.doubleValue());
        subtotalCell.setCellStyle(currencyStyle);

        // IGV
        Cell igvCell = totalRow.createCell(7);
        igvCell.setCellValue(igv.doubleValue());
        igvCell.setCellStyle(currencyStyle);

        // Total
        Cell totalCell = totalRow.createCell(8);
        totalCell.setCellValue(total.doubleValue());
        totalCell.setCellStyle(currencyStyle);

        return rowNum;
    }

    private int agregarTotalesUsoVehiculos(Sheet sheet, CellStyle totalStyle, CellStyle currencyStyle,
                                           BigDecimal totalRecaudado, int totalDias, int totalContratos, int rowNum, int numColumns) {
        Row totalRow = sheet.createRow(rowNum++);

        // Celda de "TOTALES GENERALES"
        Cell labelCell = totalRow.createCell(5);
        labelCell.setCellValue("TOTALES GENERALES:");
        labelCell.setCellStyle(totalStyle);

        // Total Recaudado
        Cell recaudadoCell = totalRow.createCell(6);
        recaudadoCell.setCellValue(totalRecaudado.doubleValue());
        recaudadoCell.setCellStyle(currencyStyle);

        // Estadísticas adicionales en siguiente fila
        Row statsRow = sheet.createRow(rowNum++);
        Cell statsLabelCell = statsRow.createCell(5);
        statsLabelCell.setCellValue("ESTADÍSTICAS:");
        statsLabelCell.setCellStyle(totalStyle);

        Cell diasCell = statsRow.createCell(6);
        diasCell.setCellValue(totalDias);
        diasCell.setCellStyle(totalStyle);

        Cell contratosCell = statsRow.createCell(7);
        contratosCell.setCellValue(totalContratos);
        contratosCell.setCellStyle(totalStyle);

        return rowNum;
    }

    private int agregarTotalesIngresos(Sheet sheet, CellStyle totalStyle, CellStyle currencyStyle,
                                       BigDecimal totalIngresos, BigDecimal totalIgv, int totalContratos,
                                       int totalClientes, int totalVehiculos, int rowNum, int numColumns) {
        Row totalRow = sheet.createRow(rowNum++);

        // Celda de "TOTALES GENERALES"
        Cell labelCell = totalRow.createCell(1);
        labelCell.setCellValue("TOTALES GENERALES:");
        labelCell.setCellStyle(totalStyle);

        // Total Ingresos
        Cell ingresosCell = totalRow.createCell(2);
        ingresosCell.setCellValue(totalIngresos.doubleValue());
        ingresosCell.setCellStyle(currencyStyle);

        // IGV
        Cell igvCell = totalRow.createCell(4);
        igvCell.setCellValue(totalIgv.doubleValue());
        igvCell.setCellStyle(currencyStyle);

        // Estadísticas adicionales en siguiente fila
        Row statsRow = sheet.createRow(rowNum++);
        Cell statsLabelCell = statsRow.createCell(1);
        statsLabelCell.setCellValue("ESTADÍSTICAS:");
        statsLabelCell.setCellStyle(totalStyle);

        Cell contratosCell = statsRow.createCell(2);
        contratosCell.setCellValue(totalContratos);
        contratosCell.setCellStyle(totalStyle);

        Cell clientesCell = statsRow.createCell(5);
        clientesCell.setCellValue(totalClientes);
        clientesCell.setCellStyle(totalStyle);

        Cell vehiculosCell = statsRow.createCell(6);
        vehiculosCell.setCellValue(totalVehiculos);
        vehiculosCell.setCellStyle(totalStyle);

        return rowNum;
    }

    private void cellSegura(Row row, int column, String valor) {
        Cell cell = row.createCell(column);
        cell.setCellValue(valor != null ? valor : "N/A");
    }

    private void cellSegura(Row row, int column, Integer valor) {
        Cell cell = row.createCell(column);
        cell.setCellValue(valor != null ? valor : 0);
    }

    private void cellSegura(Row row, int column, Double valor) {
        Cell cell = row.createCell(column);
        cell.setCellValue(valor != null ? valor : 0.0);
    }
}
