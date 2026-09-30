package com.sparknity.pos.controller;

import com.sparknity.pos.dto.DashboardStatsResponse;
import com.sparknity.pos.dto.SaleRequest;
import com.sparknity.pos.dto.SaleResponse;
import com.sparknity.pos.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@Tag(name = "Sale & Billing Management", description = "APIs for creating sales and viewing sale history")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    @Operation(summary = "Create a new sale transaction with automatic stock reduction")
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request) {
        SaleResponse response = saleService.createSale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get list or paginated sales history")
    public ResponseEntity<?> getSales(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @PageableDefault(size = 10) Pageable pageable) {

        if (page != null || size != null) {
            Page<SaleResponse> pagedSales = saleService.getSales(pageable);
            return ResponseEntity.ok(pagedSales);
        }

        List<SaleResponse> allSales = saleService.getAllSales();
        return ResponseEntity.ok(allSales);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed sale receipt by ID")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long id) {
        SaleResponse response = saleService.getSaleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard summary statistics")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = saleService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
