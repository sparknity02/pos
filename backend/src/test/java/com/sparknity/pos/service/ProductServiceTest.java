package com.sparknity.pos.service;

import com.sparknity.pos.dto.ProductRequest;
import com.sparknity.pos.dto.ProductResponse;
import com.sparknity.pos.entity.Product;
import com.sparknity.pos.exception.ResourceNotFoundException;
import com.sparknity.pos.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product("Wireless Mouse", new BigDecimal("799.00"), 25);
        sampleProduct.setId(1L);
    }

    @Test
    @DisplayName("Create product successfully")
    void testCreateProduct() {
        ProductRequest request = new ProductRequest("Wireless Mouse", new BigDecimal("799.00"), 25);
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("Wireless Mouse", response.getName());
        assertEquals(new BigDecimal("799.00"), response.getPrice());
        assertEquals(25, response.getStockQuantity());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Get product by ID - Success")
    void testGetProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Wireless Mouse", response.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Get product by ID - Not Found Exception")
    void testGetProductById_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                productService.getProductById(99L)
        );

        assertTrue(ex.getMessage().contains("Product with ID 99 not found"));
    }

    @Test
    @DisplayName("Update product successfully")
    void testUpdateProduct_Success() {
        ProductRequest updateReq = new ProductRequest("Updated Mouse", new BigDecimal("899.00"), 30);
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.updateProduct(1L, updateReq);

        assertNotNull(response);
        assertEquals("Updated Mouse", sampleProduct.getName());
        assertEquals(new BigDecimal("899.00"), sampleProduct.getPrice());
        assertEquals(30, sampleProduct.getStockQuantity());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("Delete product successfully")
    void testDeleteProduct_Success() {
        when(productRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1L);

        assertDoesNotThrow(() -> productService.deleteProduct(1L));
        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Delete product - Not Found Exception")
    void testDeleteProduct_NotFound() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> productService.deleteProduct(99L));
        verify(productRepository, never()).deleteById(99L);
    }

    @Test
    @DisplayName("Get paginated products with search query")
    void testGetProducts_WithSearch() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findByNameContainingIgnoreCase("mouse", pageable)).thenReturn(page);

        Page<ProductResponse> result = productService.getProducts("mouse", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Wireless Mouse", result.getContent().get(0).getName());
    }
}
