package io.github.mucsi96.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import io.github.mucsi96.authtools.WithMockUserAuthorities;

public class UserControllerTests extends BaseIntegrationTest {

    @Test
    @WithMockUserAuthorities({ "ROLE_Reader", "SCOPE_read" })
    public void returns_the_message() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get("/user"))
                .andReturn()
                .getResponse();

        assertThat(response.getStatus()).isEqualTo(200);
        DocumentContext body = JsonPath.parse(response.getContentAsString());
        assertThat(body.read("$.id", String.class)).isEqualTo("rob");
        assertThat(body.read("$.name", String.class)).isEqualTo("Robert White");
        assertThat(body.read("$.email", String.class)).isEqualTo("robert.white@mockemail.com");
        assertThat(body.read("$.authorities[0]", String.class)).isEqualTo("ROLE_Reader");
        assertThat(body.read("$.authorities[1]", String.class)).isEqualTo("SCOPE_read");
    }
}
