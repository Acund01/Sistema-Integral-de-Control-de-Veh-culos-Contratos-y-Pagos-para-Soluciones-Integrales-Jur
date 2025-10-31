package com.grupodos.alquilervehiculos.msvcoauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MsvcOauthApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsvcOauthApplication.class, args);
    }

}
