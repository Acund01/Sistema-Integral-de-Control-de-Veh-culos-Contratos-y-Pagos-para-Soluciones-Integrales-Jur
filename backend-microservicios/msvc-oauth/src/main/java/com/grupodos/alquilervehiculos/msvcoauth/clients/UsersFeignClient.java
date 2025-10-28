package com.grupodos.alquilervehiculos.msvcoauth.clients;

import com.grupodos.alquilervehiculos.msvcoauth.models.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "msvc-users")
public interface UsersFeignClient {
    @GetMapping("/api/users/username/{username}")
    User findByUsername(@PathVariable String username);
}
