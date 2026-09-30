package com.sparknity.pos.service;

import com.sparknity.pos.dto.DashboardStatsResponse;
import com.sparknity.pos.dto.SaleItemRequest;
import com.sparknity.pos.dto.SaleRequest;
import com.sparknity.pos.dto.SaleResponse;
import com.sparknity.pos.entity.Product;
import com.sparknity.pos.entity.Sale;
import com.sparknity.pos.exception.InsufficientStockException;
import com.sparknity.pos.exception.ResourceNotFoundException;
import com.sparknity.pos.repository.ProductRepository;
import com.sparknity.pos.repository.SaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private SaleService saleService;

    private Product productA;
    private Product productB;

    @BeforeEach
    void setUp() {
        productA = new Product("Wireless Mouse", new BigDecimal("799.00"), 10);
        productA.setId(1L);

        productB = new Product("USB Cable", new BigDecimal("399.00"), 5);
        productB.setId(2L);
    }

    @Test
    @DisplayName("Create sale successfully - stock reduced, total calculated")
    void testCreateSale_Success() {
        SaleRequest request = new SaleRequest(List.of(
                new SaleItemRequest(1L, 2),
                new SaleItemRequest(2L, 1)
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(productA));
        when(productRepository.findById(2L)).thenReturn(Optional.of(productB));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> {
            Sale sale = invocation.getArgument(0);
            sale.setId(101L);
            return sale;
        });

        SaleResponse response = saleService.createSale(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        // 799 * 2 + 399 * 1 = 1598 + 399 = 1997.00
        assertEquals(new BigDecimal("1997.00"), response.getTotalAmount());
        assertEquals(2, response.getItems().size());

        // Verify stock was reduced
        assertEquals(8, productA.getStockQuantity());
        assertEquals(4, productB.getStockQuantity());
        verify(productRepository, times(1)).save(productA);
        verify(productRepository, times(1)).save(productB);
        verify(saleRepository, times(1)).save(any(Sale.class));
    }

    @Test
    @DisplayName("Create sale fails when product not found")
    void testCreateSale_ProductNotFound() {
        SaleRequest request = new SaleRequest(List.of(
                new SaleItemRequest(999L, 1)
        ));

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> saleService.createSale(request));
        verify(saleRepository, never()).save(any(Sale.class));
    }

    @Test
    @DisplayName("Create sale fails when insufficient stock available")
    void testCreateSale_InsufficientStock() {
        // Product A has 10, requesting 15
        SaleRequest request = new SaleRequest(List.of(
                new SaleItemRequest(1L, 15)
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(productA));

        InsufficientStockException ex = assertThrows(InsufficientStockException.class, () ->
                saleService.createSale(request)
        );

        assertTrue(ex.getMessage().contains("Insufficient stock for product: Wireless Mouse"));
        assertEquals(10, productA.getStockQuantity()); // Stock unchanged
        verify(saleRepository, never()).save(any(Sale.class));
    }

    @Test
    @DisplayName("Create sale fails when item list is empty")
    void testCreateSale_EmptyItems() {
        SaleRequest request = new SaleRequest(List.of());

        assertThrows(IllegalArgumentException.class, () -> saleService.createSale(request));
    }

    @Test
    @DisplayName("Get sale by ID - Success")
    void testGetSaleById_Success() {
        Sale sale = new Sale(new BigDecimal("799.00"));
        sale.setId(101L);
        when(saleRepository.findByIdWithItems(101L)).thenReturn(Optional.of(sale));

        SaleResponse response = saleService.getSaleById(101L);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(new BigDecimal("799.00"), response.getTotalAmount());
    }

    @Test
    @DisplayName("Get sale by ID - Not Found")
    void testGetSaleById_NotFound() {
        when(saleRepository.findByIdWithItems(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> saleService.getSaleById(999L));
    }

    @Test
    @DisplayName("Get dashboard stats")
    void testGetDashboardStats() {
        when(productRepository.count()).thenReturn(6L);
        when(productRepository.countByStockQuantityLessThanEqual(5)).thenReturn(2L);
        when(saleRepository.count()).thenReturn(10L);
        when(saleRepository.sumTotalSalesSince(any(LocalDateTime.class))).thenReturn(new BigDecimal("3500.00"));

        DashboardStatsResponse stats = saleService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(6, stats.getTotalProducts());
        assertEquals(2, stats.getLowStockProducts());
        assertEquals(10, stats.getTotalSales());
        assertEquals(new BigDecimal("3500.00"), stats.getTodaySales());
    }
}
