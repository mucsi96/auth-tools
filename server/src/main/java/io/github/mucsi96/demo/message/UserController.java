package io.github.mucsi96.demo.message;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.mucsi96.authtools.azure.AzureAuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
public class UserController {

    @PreAuthorize("hasAuthority('ROLE_Reader') and hasAuthority('SCOPE_read')")
    @GetMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    public UserResponse getUser(
            @Parameter(hidden = true) Authentication authentication) {
        AzureAuthenticationPrincipal principal = (AzureAuthenticationPrincipal) authentication.getPrincipal();
        return UserResponse.builder()
                .id(authentication.getName())
                .name(principal.getName())
                .email(principal.getEmail())
                .authorities(authentication.getAuthorities().stream().map(a -> a.getAuthority()).toList())
                .build();
    }

    @PreAuthorize("hasAuthority('ROLE_Writer') and hasAuthority('SCOPE_write')")
    @PostMapping(value = "/change", produces = MediaType.APPLICATION_JSON_VALUE)
    public String change() {
        return "{}";
    }
}
