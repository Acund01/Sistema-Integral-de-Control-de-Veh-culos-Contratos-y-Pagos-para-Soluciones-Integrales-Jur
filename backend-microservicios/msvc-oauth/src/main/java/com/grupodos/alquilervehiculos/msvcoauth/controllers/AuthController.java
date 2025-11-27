package com.grupodos.alquilervehiculos.msvcoauth.controllers;

import com.grupodos.alquilervehiculos.msvcoauth.clients.UsersFeignClient;
import com.grupodos.alquilervehiculos.msvcoauth.dto.LoginRequest;
import com.grupodos.alquilervehiculos.msvcoauth.dto.TokenResponse;
import com.grupodos.alquilervehiculos.msvcoauth.models.Role;
import com.grupodos.alquilervehiculos.msvcoauth.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security")
public class AuthController {

    private final UsersFeignClient usersFeignClient;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthController(UsersFeignClient usersFeignClient,
                          PasswordEncoder passwordEncoder,
                          JwtEncoder jwtEncoder) {
        this.usersFeignClient = usersFeignClient;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }
    @GetMapping("/ping")
    public String ping() {
        return "OK";
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user;
        try {
            // OJO: ajusta este metodo si tu UsersFeignClient se llama distinto
            user = usersFeignClient.findByUsername(request.getUsername());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario o contraseña incorrectos");
        }

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario o contraseña incorrectos");
        }

        Instant now = Instant.now();
        long expiresIn = 3600L; // 1 hora

        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("http://127.0.0.1:9100")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiresIn))
                .subject(user.getUsername())
                .claim("roles", roles)
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        TokenResponse response = new TokenResponse();
        response.setToken(token);
        response.setTokenType("Bearer");
        response.setExpiresIn(expiresIn);
        response.setUsername(user.getUsername());
        response.setRoles(roles);

        return ResponseEntity.ok(response);
    }
}
