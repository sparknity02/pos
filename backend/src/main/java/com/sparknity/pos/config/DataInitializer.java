package com.sparknity.pos.config;

import com.sparknity.pos.entity.Product;
import com.sparknity.pos.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            List<Product> sampleProducts = List.of(
                    new Product("Wireless Mouse", new BigDecimal("799.00"), 25),
                    new Product("Mechanical Keyboard", new BigDecimal("1499.00"), 12),
                    new Product("USB-C Cable", new BigDecimal("399.00"), 30),
                    new Product("Laptop Stand", new BigDecimal("1299.00"), 15),
                    new Product("HDMI Cable", new BigDecimal("499.00"), 20),
                    new Product("Webcam", new BigDecimal("2199.00"), 8)
            );
            productRepository.saveAll(sampleProducts);
        }
    }
}
