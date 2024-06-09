package io.github.mucsi96.authtools.security;

import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class TestSecurityConfigurer extends SecurityConfigurer {

    public static SecurityContext createSecurityContext(String[] roles) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        Collection<GrantedAuthority> authorities = AuthorityUtils
                .createAuthorityList(Stream.of(roles).map(role -> "ROLE_" + role).toList());
        DefaultOAuth2AuthenticatedPrincipal principal = new DefaultOAuth2AuthenticatedPrincipal("rob",
                Map.of("name", "Robert White", "email", "robert.white@mockemail.com"), authorities);

        context.setAuthentication(new BearerTokenAuthentication(principal,
                new OAuth2AccessToken(TokenType.BEARER, "mock-token", Instant.now(), Instant.now()),
                authorities));

        return context;
    }

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
                .exceptionHandling(c -> c.accessDeniedHandler(new RestAccessDeniedHandler()));
    }

}
