package io.github.mucsi96.authtools;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.mucsi96.authtools.azure.AzureAuthenticationPrincipal;

@RestController
public class MeController {

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_user') and hasAuthority('SCOPE_api')")
    String getMe(@AuthenticationPrincipal AzureAuthenticationPrincipal principal) {
        return principal.getName();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_admin') and hasAuthority('SCOPE_api')")
    String getAdmin(@AuthenticationPrincipal AzureAuthenticationPrincipal principal) {
        return principal.getName();
    }
}
