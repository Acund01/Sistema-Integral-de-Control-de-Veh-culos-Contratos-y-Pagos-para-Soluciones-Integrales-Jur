package com.grupodos.alquilervehiculos.apigateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

import static org.springframework.security.config.Customizer.withDefaults;

import java.util.Collection;
import java.util.stream.Collectors;;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) throws Exception{

        return http.authorizeExchange(authz -> {
                    authz.pathMatchers("/authorized", "/logout").permitAll()
                            .pathMatchers("api/users").permitAll()
                            .pathMatchers(HttpMethod.GET, "/api/clientes", "/api/vehiculos").permitAll()
                            .pathMatchers(HttpMethod.POST, "/api/clientes").hasAnyRole("ADMIN", "USER")
                            .pathMatchers("/api/contratos/**", "/api/clientes/**").hasRole("ADMIN")
                            .anyExchange().authenticated();
                }).cors(csrf -> csrf.disable())
                .oauth2Login(withDefaults())
                .oauth2Client(withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(
                        jwt -> jwt.jwtAuthenticationConverter(new Converter<Jwt, Mono<AbstractAuthenticationToken>>() {
                            @Override
                            public Mono<AbstractAuthenticationToken> convert(Jwt source) {
                                Collection<String> roles = source.getClaimAsStringList("roles");
                                Collection<GrantedAuthority> authorities = roles.stream()
                                        .map(SimpleGrantedAuthority::new)
                                        .collect(Collectors.toList());

                                        return Mono.just(new JwtAuthenticationToken(source, authorities));
                            }
                        })
                ))
                .build();
    }

}
