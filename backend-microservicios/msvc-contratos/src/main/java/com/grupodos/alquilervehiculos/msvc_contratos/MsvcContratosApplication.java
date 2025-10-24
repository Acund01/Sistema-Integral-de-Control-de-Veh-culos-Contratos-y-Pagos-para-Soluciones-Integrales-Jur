package com.grupodos.alquilervehiculos.msvc_contratos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MsvcContratosApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsvcContratosApplication.class, args);
	}

}
