package com.grupodos.alquilervehiculos.msvcclientes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteNaturalRequestDto(

    @NotBlank(message = "El nombre es obligatorio")
    String nombre,

    @NotBlank(message = "El apellido es obligatorio")
    String apellido,

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El dni debe tener 8 caracteres")
    String dni,

    @Email(message = "Correo invalido")
    String correo,

    String telefono,

    String direccion
) {}
