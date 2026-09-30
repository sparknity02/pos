package com.sparknity.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SaleResponse {

    private Long id;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private List<SaleItemResponse> items = new ArrayList<>();

    public SaleResponse() {
    }

    public SaleResponse(Long id, LocalDateTime createdAt, BigDecimal totalAmount, List<SaleItemResponse> items) {
        this.id = id;
        this.createdAt = createdAt;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<SaleItemResponse> getItems() {
        return items;
    }

    public void setItems(List<SaleItemResponse> items) {
        this.items = items;
    }
}
