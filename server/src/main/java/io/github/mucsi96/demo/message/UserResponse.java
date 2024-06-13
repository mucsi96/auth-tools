package io.github.mucsi96.demo.message;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private final String id;
    private final String name;
    private final String email;
    private final List<String> authorities;
}
