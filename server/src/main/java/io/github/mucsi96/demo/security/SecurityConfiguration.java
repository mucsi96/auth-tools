package io.github.mucsi96.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import io.github.mucsi96.authtools.security.SecurityConfigurer;


@Configuration
public class SecurityConfiguration {

    @Bean
    @Profile("prod")
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityConfigurer configurer) throws Exception {
        return http.with(configurer, Customizer.withDefaults()).build();
    }

    @Bean
    @Profile("!prod")
    SecurityFilterChain mockSecurityFilterChain(HttpSecurity http, SecurityConfigurer configurer) throws Exception {
        return http.with(configurer, Customizer.withDefaults()).build();
    }
}
