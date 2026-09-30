package com.sparknity.pos.dto;

import java.math.BigDecimal;

public class DashboardStatsResponse {

    private long totalProducts;
    private long lowStockProducts;
    private long totalSales;
    private BigDecimal todaySales;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalProducts, long lowStockProducts, long totalSales, BigDecimal todaySales) {
        this.totalProducts = totalProducts;
        this.lowStockProducts = lowStockProducts;
        this.totalSales = totalSales;
        this.todaySales = todaySales;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(long totalSales) {
        this.totalSales = totalSales;
    }

    public BigDecimal getTodaySales() {
        return todaySales;
    }

    public void setTodaySales(BigDecimal todaySales) {
        this.todaySales = todaySales;
    }
}
