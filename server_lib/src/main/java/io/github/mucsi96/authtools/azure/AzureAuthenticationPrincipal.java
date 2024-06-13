package io.github.mucsi96.authtools.azure;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AzureAuthenticationPrincipal {
    private final String name;
    private final String email;
}
