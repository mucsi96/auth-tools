package io.github.mucsi96.authtools;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Profile;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

@ActiveProfiles("local")
public class LocalSecurityConfigurationTest extends BaseIntegrationTest {

        @Test
        public void returns_logged_in_user_details() throws Exception {
                MockHttpServletResponse response = mockMvc.perform(
                                get("/me"))
                                .andReturn()
                                .getResponse();

                assertThat(response.getStatus()).isEqualTo(200);
                assertThat(response.getContentAsString()).isEqualTo("Robert White");

        }

        @Test
        @Profile("test")
        public void returns_forbidden_if_user_has_no_user_authority() throws Exception {
                MockHttpServletResponse response = mockMvc.perform(
                                get("/admin"))
                                .andReturn()
                                .getResponse();

                assertThat(response.getStatus()).isEqualTo(403);
                DocumentContext body = JsonPath.parse(response.getContentAsString());
                assertThat(body.read("$.status", Integer.class)).isEqualTo(403);
        }
}
