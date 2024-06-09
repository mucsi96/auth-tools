package io.github.mucsi96.demo.message;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RolesAllowed("user")
public class MessageController {

    @GetMapping(value = "/message", produces = MediaType.APPLICATION_JSON_VALUE)
    public MessageResponse getMessage(
            @Parameter(hidden = true) @AuthenticationPrincipal OAuth2AuthenticatedPrincipal principal) {
        return new MessageResponse(
                "Hi " + principal.getAttribute("name") + "! ");
    }
}
