package com.sparknity.pos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "eureka.client.enabled=false"
})
class PosApplicationTests {

    @Test
    void contextLoads() {
    }
}
