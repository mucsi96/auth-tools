package io.github.mucsi96.demo;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockUserRolesSecurityContextFactory.class)
public @interface WithMockUserAuthorities {
    String[] value() default { "user" };
}
