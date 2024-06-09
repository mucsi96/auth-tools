package io.github.mucsi96.authtools;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import io.github.mucsi96.authtools.security.SecurityConfigurer;

@SpringBootApplication
public class TestApplication {
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityConfigurer authtoolsSecurityConfigurer)
			throws Exception {
		http.with(authtoolsSecurityConfigurer, Customizer.withDefaults());
		return http.build();
	}

	public static void main(String[] args) {
		SpringApplication.run(TestApplication.class, args);
	}

}
