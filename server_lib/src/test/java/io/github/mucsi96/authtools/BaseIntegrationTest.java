package io.github.mucsi96.authtools;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;

import jakarta.servlet.http.Cookie;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext
public class BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @RegisterExtension
    static WireMockExtension mockAuthServer = WireMockExtension.newInstance()
            .options(wireMockConfig().dynamicPort())
            .build();

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("authtools.introspectionUri", () -> mockAuthServer.baseUrl() + "/api/oidc/introspection");
        registry.add("authtools.userInfoUri", () -> mockAuthServer.baseUrl() + "/api/oidc/userinfo");
        registry.add("authtools.clientId", () -> "clientId");
        registry.add("authtools.clientSecret", () -> "clientSecret");
    }

    @BeforeEach
    public void beforeEach() throws Exception {
        mockAuthServer.stubFor(WireMock.post("/api/oidc/introspection")
                .willReturn(WireMock.aResponse()
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBodyFile("introspection.json")));
        mockAuthServer.stubFor(WireMock.get("/api/oidc/userinfo")
                .willReturn(WireMock.aResponse()
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBodyFile("user_info.json")));
    }

    Cookie getUserAccessToken() throws Exception {
        mockAuthServer.stubFor(WireMock.get("/api/oidc/userinfo")
                .willReturn(WireMock.aResponse()
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBodyFile("user_info.json")));
        return new Cookie("accessToken", "user-access-token");
    }

    Cookie getGuestAccessToken() throws Exception {
        mockAuthServer.stubFor(WireMock.get("/api/oidc/userinfo")
                .willReturn(WireMock.aResponse()
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBodyFile("user_info_guest.json")));
        return new Cookie("accessToken", "guest-access-token");
    }
}
