package io.github.mucsi96.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

public class MessageControllerTests extends BaseIntegrationTest {
    @Test
    public void returns_the_message() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get("/message"))
                .andReturn()
                .getResponse();

        assertThat(response.getStatus()).isEqualTo(200);
        DocumentContext body = JsonPath.parse(response.getContentAsString());
        assertThat(body.read("$.message", String.class)).isEqualTo("Hi Robert White!");

    }
}
