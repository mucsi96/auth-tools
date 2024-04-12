package io.github.mucsi96.authtools;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

@ActiveProfiles("prod")
public class HealthTest extends BaseIntegrationTest {

    @Test
    void retunrs_status() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(get("/actuator/health/liveness")).andReturn().getResponse();

        assertThat(response.getStatus()).isEqualTo(200);
        DocumentContext body = JsonPath.parse(response.getContentAsString());
        assertThat(body.read("$.status", String.class)).isEqualTo("UP");
    }
}
