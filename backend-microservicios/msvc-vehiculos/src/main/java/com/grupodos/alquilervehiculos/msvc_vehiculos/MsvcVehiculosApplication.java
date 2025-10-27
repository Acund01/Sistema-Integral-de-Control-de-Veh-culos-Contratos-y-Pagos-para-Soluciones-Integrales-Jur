package com.grupodos.alquilervehiculos.msvc_vehiculos;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MsvcVehiculosApplication {

    private static final Logger log = LoggerFactory.getLogger(MsvcVehiculosApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(MsvcVehiculosApplication.class, args);
        log.info("Microservicio de Vehículos iniciado exitosamente!");
	}

}
