package io.github.mucsi96.authtools.security;

import java.util.Collection;

import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.security.web.authentication.AuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.stereotype.Component;

import io.github.mucsi96.authtools.azure.AzureAuthenticationPrincipal;
import io.github.mucsi96.authtools.azure.AzureAuthenticationToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
@Profile("local")
public class LocalSecurityConfigurer extends SecurityConfigurer {
    private final AuthtoolsSecurityConfiguration configuration;

    @Override
    public void init(HttpSecurity http) throws Exception {
        http
                .sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .anonymous(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .headers(configurer -> configurer.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(c -> c.accessDeniedHandler(new RestAccessDeniedHandler()))
                .addFilterAt(new MockAuthenticationFilter(), BasicAuthenticationFilter.class);
    }

    class MockAuthenticationFilter extends AuthenticationFilter {
        public MockAuthenticationFilter() {
            super((AuthenticationManager) authentication -> {
                return authentication;
            }, (AuthenticationConverter) request -> {
                Collection<GrantedAuthority> authorities = AuthorityUtils
                        .createAuthorityList(configuration.getMockAuthorities());
                var jwt = Jwt
                        .withTokenValue("test-token")
                        .subject("rob")
                        .header("alg", "none")
                        .build();
                var principal = AzureAuthenticationPrincipal.builder()
                        .name("Robert White")
                        .email("robert.white@mockemail.com")
                        .build();

                return new AzureAuthenticationToken(jwt, principal, authorities);
            });

            this.setSuccessHandler((HttpServletRequest request, HttpServletResponse response,
                    Authentication authentication) -> {
            });
        }
    }
}
