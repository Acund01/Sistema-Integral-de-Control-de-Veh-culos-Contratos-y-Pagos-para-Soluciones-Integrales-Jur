package com.grupodos.alquilervehiculos.msvcreportes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class MsvcReportesApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsvcReportesApplication.class, args);
	}

}
