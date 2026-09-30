package com.sparknity.pos.service;

import com.sparknity.pos.dto.ProductRequest;
import com.sparknity.pos.dto.ProductResponse;
import com.sparknity.pos.entity.Product;
import com.sparknity.pos.exception.ResourceNotFoundException;
import com.sparknity.pos.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(String search, Pageable pageable) {
        Page<Product> page;
        if (search != null && !search.trim().isEmpty()) {
            page = productRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            page = productRepository.findAll(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(String search) {
        List<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            products = productRepository.findAll();
        }
        return products.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found"));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product(request.getName().trim(), request.getPrice(), request.getStockQuantity());
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found"));

        product.setName(request.getName().trim());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product with ID " + id + " not found");
        }
        productRepository.deleteById(id);
    }

    public ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
