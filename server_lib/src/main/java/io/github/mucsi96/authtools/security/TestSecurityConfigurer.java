package io.github.mucsi96.authtools.security;

import java.util.Collection;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import io.github.mucsi96.authtools.azure.AzureAuthenticationPrincipal;
import io.github.mucsi96.authtools.azure.AzureAuthenticationToken;

@Component
@Profile("test")
public class TestSecurityConfigurer extends SecurityConfigurer {

        public static SecurityContext createSecurityContext(List<String> authoritiesList) {
                SecurityContext context = SecurityContextHolder.createEmptyContext();

                Collection<GrantedAuthority> authorities = AuthorityUtils
                                .createAuthorityList(authoritiesList);

                var jwt = Jwt
                                .withTokenValue("test-token")
                                .subject("rob")
                                .header("alg", "none")
                                .build();
                var principal = AzureAuthenticationPrincipal.builder()
                                .name("Robert White")
                                .email("robert.white@mockemail.com")
                                .build();

                context.setAuthentication(new AzureAuthenticationToken(jwt, principal, authorities));

                return context;
        }

        @Override
        public void init(HttpSecurity http) throws Exception {
                http
                                .sessionManagement(configurer -> configurer
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .anonymous(AbstractHttpConfigurer::disable)
                                .csrf(AbstractHttpConfigurer::disable)
                                .headers(configurer -> configurer
                                                .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .logout(AbstractHttpConfigurer::disable)
                                .exceptionHandling(c -> c.accessDeniedHandler(new RestAccessDeniedHandler()));
        }

}
