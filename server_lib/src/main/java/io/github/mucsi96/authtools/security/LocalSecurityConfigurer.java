package io.github.mucsi96.authtools.security;

import java.time.Instant;
import java.util.Collection;
import java.util.Map;

import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.security.web.authentication.AuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Profile("local")
public class LocalSecurityConfigurer extends SecurityConfigurer {

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
                Collection<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("ROLE_user");
                DefaultOAuth2AuthenticatedPrincipal principal = new DefaultOAuth2AuthenticatedPrincipal("rob",
                        Map.of("name", "Robert White", "email", "robert.white@mockemail.com"), authorities);

                return new BearerTokenAuthentication(principal,
                        new OAuth2AccessToken(TokenType.BEARER, "mock-token", Instant.now(), Instant.now()),
                        authorities);
            });

            this.setSuccessHandler((HttpServletRequest request, HttpServletResponse response,
                    Authentication authentication) -> {
            });
        }
    }
}
