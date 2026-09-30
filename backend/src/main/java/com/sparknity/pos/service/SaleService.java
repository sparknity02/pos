package com.sparknity.pos.service;

import com.sparknity.pos.dto.*;
import com.sparknity.pos.entity.Product;
import com.sparknity.pos.entity.Sale;
import com.sparknity.pos.entity.SaleItem;
import com.sparknity.pos.exception.InsufficientStockException;
import com.sparknity.pos.exception.ResourceNotFoundException;
import com.sparknity.pos.repository.ProductRepository;
import com.sparknity.pos.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public SaleResponse createSale(SaleRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Sale must contain at least one item");
        }

        Sale sale = new Sale();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SaleItemResponse> itemResponses = new ArrayList<>();

        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + itemReq.getProductId() + " not found"));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName()
                        + " (Available: " + product.getStockQuantity() + ", Requested: " + itemReq.getQuantity() + ")");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Snapshot the current unit price
            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            // Create SaleItem with historical unitPrice
            SaleItem saleItem = new SaleItem(product, itemReq.getQuantity(), unitPrice);
            sale.addItem(saleItem);
        }

        sale.setTotalAmount(totalAmount);
        Sale savedSale = saleRepository.save(sale);

        return mapToResponse(savedSale);
    }

    @Transactional(readOnly = true)
    public Page<SaleResponse> getSales(Pageable pageable) {
        return saleRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAllWithItems().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale with ID " + id + " not found"));
        return mapToResponse(sale);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countByStockQuantityLessThanEqual(5);
        long totalSales = saleRepository.count();

        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        BigDecimal todaySales = saleRepository.sumTotalSalesSince(startOfToday);

        return new DashboardStatsResponse(totalProducts, lowStockProducts, totalSales, todaySales != null ? todaySales : BigDecimal.ZERO);
    }

    public SaleResponse mapToResponse(Sale sale) {
        List<SaleItemResponse> items = sale.getItems().stream()
                .map(item -> new SaleItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProduct() != null ? item.getProduct().getName() : "Unknown",
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return new SaleResponse(
                sale.getId(),
                sale.getCreatedAt(),
                sale.getTotalAmount(),
                items
        );
    }
}
