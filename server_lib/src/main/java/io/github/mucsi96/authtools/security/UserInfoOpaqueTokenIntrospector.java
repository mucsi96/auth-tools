package io.github.mucsi96.authtools.security;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.resource.introspection.NimbusOpaqueTokenIntrospector;
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class UserInfoOpaqueTokenIntrospector implements OpaqueTokenIntrospector {
    private final OpaqueTokenIntrospector delegate;
    private final RestTemplate restTemplate;
    private final SecurityConfiguration configuration;

    UserInfoOpaqueTokenIntrospector(SecurityConfiguration configuration) {
        this.configuration = configuration;
        delegate = new NimbusOpaqueTokenIntrospector(
                configuration.getIntrospectionUri(), configuration.getClientId(), configuration.getClientSecret());
        restTemplate = new RestTemplate();
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String accessToken) {
        this.delegate.introspect(accessToken);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        UserInfo userInfo = restTemplate
                .exchange(configuration.getUserInfoUri(), HttpMethod.GET, entity, UserInfo.class).getBody();

        if (userInfo == null) {
            throw new OAuth2IntrospectionException("Unable to fetch user info");
        }

        return new DefaultOAuth2AuthenticatedPrincipal(
                userInfo.preferred_username(),
                Map.of("name", userInfo.name(), "email", userInfo.email()),
                AuthorityUtils.createAuthorityList(userInfo.groups().stream().map(group -> "ROLE_" + group).toList()));
    }

}
