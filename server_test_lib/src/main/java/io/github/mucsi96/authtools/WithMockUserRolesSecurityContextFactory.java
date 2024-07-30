package io.github.mucsi96.authtools;

import java.util.List;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import io.github.mucsi96.authtools.security.TestSecurityConfigurer;

public class WithMockUserRolesSecurityContextFactory implements WithSecurityContextFactory<WithMockUserAuthorities> {

    @Override
    public SecurityContext createSecurityContext(WithMockUserAuthorities mockUser) {
        return TestSecurityConfigurer.createSecurityContext(List.of(mockUser.value()));
    }

}
