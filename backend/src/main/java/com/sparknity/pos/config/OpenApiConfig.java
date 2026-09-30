package com.sparknity.pos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sparknity POS API")
                        .version("1.0.0")
                        .description("Point of Sale & Billing Management System - Simple. Fast. Reliable.")
                        .contact(new Contact().name("Sparknity POS Team")));
    }
}
