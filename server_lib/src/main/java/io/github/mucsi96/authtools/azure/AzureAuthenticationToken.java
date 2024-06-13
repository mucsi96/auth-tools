package io.github.mucsi96.authtools.azure;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class AzureAuthenticationToken extends JwtAuthenticationToken {
    private final Object principal;

    public AzureAuthenticationToken(Jwt jwt, Object principal, Collection<? extends GrantedAuthority> authorities) {
        super(jwt, authorities);
        this.principal = principal;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
}
