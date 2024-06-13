package io.github.mucsi96.authtools.security;

import java.util.Arrays;

import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.DelegatingJwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import io.github.mucsi96.authtools.azure.AzureAuthenticationPrincipal;
import io.github.mucsi96.authtools.azure.AzureAuthenticationToken;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Profile("prod")
public class ProdSecurityConfigurer extends SecurityConfigurer {
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
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(bearerTokenResolver())
                        .authenticationEntryPoint(new RestAuthenticationEntryPoint())
                        .accessDeniedHandler(new RestAccessDeniedHandler())
                        .jwt(customize -> customize
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())));
    }

    BearerTokenResolver bearerTokenResolver() {
        return request -> {
            Cookie cookie = WebUtils.getCookie(request, configuration.getCookieNamespace() + ".accessToken");
            return cookie != null ? cookie.getValue() : null;
        };
    }

    Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter() {
        var rolesConverter = new JwtGrantedAuthoritiesConverter();
        rolesConverter.setAuthorityPrefix("ROLE_");
        rolesConverter.setAuthoritiesClaimName("roles");

        var scopesConverter = new JwtGrantedAuthoritiesConverter();

        var converter = new DelegatingJwtGrantedAuthoritiesConverter(
                Arrays.asList(rolesConverter, scopesConverter));

        return jwt -> {
            var principal = AzureAuthenticationPrincipal.builder()
                    .name(jwt.getClaim("name"))
                    .email(jwt.getClaim("email"))
                    .build();

            return new AzureAuthenticationToken(jwt, principal, converter.convert(jwt));
        };
    }
}
