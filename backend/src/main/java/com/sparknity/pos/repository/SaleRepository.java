package com.sparknity.pos.repository;

import com.sparknity.pos.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.items i LEFT JOIN FETCH i.product ORDER BY s.createdAt DESC")
    List<Sale> findAllWithItems();

    @Query("SELECT s FROM Sale s WHERE s.id = :id")
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Sale> findByIdWithItems(@Param("id") Long id);

    Page<Sale> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.createdAt >= :startDate")
    BigDecimal sumTotalSalesSince(@Param("startDate") LocalDateTime startDate);
}
