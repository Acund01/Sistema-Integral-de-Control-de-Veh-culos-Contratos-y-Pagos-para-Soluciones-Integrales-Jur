package com.grupodos.alquilervehiculos.msvcoauth.services;

import com.grupodos.alquilervehiculos.msvcoauth.clients.UsersFeignClient;
import com.grupodos.alquilervehiculos.msvcoauth.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsersService implements UserDetailsService {

    @Autowired
    private UsersFeignClient usersFeignClient;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            User user = usersFeignClient.findByUsername(username);
            List<GrantedAuthority> authorities = user.getRoles()
                    .stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName()))
                    .collect(Collectors.toList());

            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    user.isEnabled(),
                    true, true, true,
                    authorities
            );
        } catch (Exception e) {
            throw new UsernameNotFoundException("Usuario no encontrado: " + username);
        }
    }
}
