package com.grupodos.alquilervehiculos.msvcclientes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteEmpresaRequestDto(

    @NotBlank(message = "La razon social es obligatoria")
    String razonSocial,

    @NotBlank(message = "El RUC es obligatorio")
    @Size(min = 11, max = 11, message = "El RUC debe tener 11 digitos")
    String ruc,

    String representante,

    @Email(message = "Correo invalido")
    String correo,

    String telefono,

    String direccion

) {}
