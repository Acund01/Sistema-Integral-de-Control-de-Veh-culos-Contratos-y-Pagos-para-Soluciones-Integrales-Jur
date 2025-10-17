package com.grupodos.alquilervehiculos.msvcusers.services;

import com.grupodos.alquilervehiculos.msvcusers.entities.User;

import java.util.Optional;

public interface UserService {

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    Iterable<User> findAll();

    User save(User user);

    Optional<User> update(User user, Long id);

    void delete(Long id);

}
