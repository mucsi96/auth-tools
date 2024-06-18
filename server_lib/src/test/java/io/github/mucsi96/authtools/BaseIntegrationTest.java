package io.github.mucsi96.authtools;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import jakarta.servlet.http.Cookie;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext
public class BaseIntegrationTest {
        private static KeyPair keyPair;
        private static final String KEY_ID = "key1";
        private static String jwks;

        @Autowired
        MockMvc mockMvc;

        @RegisterExtension
        static WireMockExtension mockAuthServer = WireMockExtension.newInstance()
                        .options(wireMockConfig().dynamicPort())
                        .build();

        @DynamicPropertySource
        static void overrideProperties(DynamicPropertyRegistry registry) {
                registry.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri", mockAuthServer::baseUrl);
        }

        private static void generateRSAKeyPair() throws NoSuchAlgorithmException {
                var keyPairGenerator = KeyPairGenerator.getInstance("RSA");
                keyPairGenerator.initialize(2048);
                keyPair = keyPairGenerator.generateKeyPair();
        }

        private static void createJWKS() {
                var jwk = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                                .keyID(KEY_ID)
                                .build()
                                .toJSONObject().toString();

                jwks = String.format("{\"keys\": [%s]}", jwk);
        }

        Cookie createAccessTokenCookie(JWTClaimsSet claimsSet) throws Exception {
                var signer = new RSASSASigner(keyPair.getPrivate());
                var signedJWT = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(KEY_ID).build(),
                                claimsSet);
                signedJWT.sign(signer);
                return new Cookie("demo.accessToken", signedJWT.serialize());
        }

        @BeforeAll
        public static void beforeAll() throws NoSuchAlgorithmException {
                generateRSAKeyPair();
                createJWKS();
        }

        @BeforeEach
        public void beforeEach() throws Exception {
                mockAuthServer.stubFor(get("/")
                                .willReturn(aResponse()
                                                .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                                .withBody(jwks)));
        }

        Cookie getUserAccessToken() throws Exception {
                return createAccessTokenCookie(new JWTClaimsSet.Builder()
                                .subject("user")
                                .claim("name", "Robert White")
                                .issuer(mockAuthServer.baseUrl())
                                .expirationTime(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                                .claim("scp", "api")
                                .claim("roles", new String[] { "user" })
                                .build());
        }

        Cookie getGuestAccessToken() throws Exception {
                return createAccessTokenCookie(new JWTClaimsSet.Builder()
                                .subject("guest")
                                .claim("name", "Robert White")
                                .issuer(mockAuthServer.baseUrl())
                                .expirationTime(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                                .claim("scp", "api")
                                .claim("roles", new String[] { "guest" })
                                .build());
        }
}
