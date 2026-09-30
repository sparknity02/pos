# Sparknity POS - System Architecture Specifications

This document outlines the complete architectural specifications, component boundaries, communication protocols, and data models for Sparknity POS. It includes ready-to-use Mermaid syntax, PlantUML diagrams, and prompt descriptions for visual diagram generation.

---

## 1. High-Level Architecture Overview

The system follows a decoupled, three-tier enterprise web architecture with client-side rendering, a transactional RESTful service layer, service discovery, and a relational database.

![Sparknity POS System Architecture](docs/architecture.jpg)

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|                                                                                   |
|  React 19 + Vite (Port: 5173)                                                     |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |     Dashboard      |  |    POS Register    |  |     Inventory      |           |
|  |   (/)              |  |    (/billing)      |  |    (/products)     |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  +--------------------+  +--------------------+                                   |
|  |   Sales History    |  |    Receipt Modal   |                                   |
|  |   (/sales)         |  |    (Print/View)    |                                   |
|  +--------------------+  +--------------------+                                   |
|                          |                                                        |
|                          +--------+ Axios HTTP Client (JSON over REST)            |
+-----------------------------------|-----------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                              APPLICATION TIER                                     |
|                                                                                   |
|  Spring Boot 4.1.1 (Java 25) - POS Service (Port: 8080)                           |
|                                                                                   |
|  [REST Controllers]                                                               |
|  - ProductController (/api/products)                                              |
|  - SaleController (/api/sales)                                                    |
|         |                                                                         |
|         v                                                                         |
|  [Validation & Error Handling]                                                    |
|  - Jakarta Validation (@Valid, @NotNull, @Positive, @Min)                         |
|  - GlobalExceptionHandler (@RestControllerAdvice)                                 |
|         |                                                                         |
|         v                                                                         |
|  [Business Service Layer]                                                         |
|  - ProductService (Catalog management, search, stock validation)                  |
|  - SaleService (@Transactional atomic checkout, unit price snapshot, stock cut)   |
|         |                                                                         |
|         v                                                                         |
|  [Data Access Layer]                                                              |
|  - Spring Data JPA & Hibernate 7                                                  |
|  - ProductRepository, SaleRepository, SaleItemRepository                         |
+-------------------+---------------------------------------------------------------+
                    |                                  ^
                    | JDBC / TCP                       | Heartbeat & Registration
                    v                                  |
+----------------------------------+   +--------------------------------------------+
|         DATABASE TIER            |   |          SERVICE DISCOVERY TIER            |
|                                  |   |                                            |
|  MySQL 8.0 (Port: 3306)          |   |  Netflix Eureka Server (Port: 8761)        |
|  Database: pos_db                |   |  - Instance: pos-service                   |
|  - products                      |   |  - Status: UP                              |
|  - sales                         |   |  - Dashboard: http://localhost:8761        |
|  - sale_items                    |   |                                            |
+----------------------------------+   +--------------------------------------------+
```

---

## 2. Mermaid Component Diagram (Paste into Mermaid Live / Notion / GitHub)

```mermaid
flowchart TB
    subgraph ClientTier["Client Tier (Browser)"]
        UI["React 19 + Vite Application\n(Port: 5173)"]
        Dash["Dashboard\n(/)"]
        POS["POS Terminal / Cart\n(/billing)"]
        Prod["Product Catalog\n(/products)"]
        Sales["Sales History\n(/sales)"]
        Axios["Axios REST Client\n(api.js)"]

        Dash --- UI
        POS --- UI
        Prod --- UI
        Sales --- UI
        UI --> Axios
    end

    subgraph ServiceDiscovery["Service Discovery Tier"]
        Eureka["Netflix Eureka Server\n(Port: 8761)\nInstance Registry"]
    end

    subgraph BackendTier["Application Tier (Spring Boot / Java 25)"]
        direction TB
        subgraph API["REST Controllers (Port: 8080)"]
            PC["ProductController\n/api/products"]
            SC["SaleController\n/api/sales"]
            Swagger["OpenAPI / Swagger UI\n/swagger-ui/index.html"]
        end

        subgraph Middleware["Validation & Exception Handling"]
            Val["Jakarta Bean Validation\n(@Valid, @Positive, @Min)"]
            GEH["GlobalExceptionHandler\n(@RestControllerAdvice)"]
        end

        subgraph ServiceLayer["Business Logic Layer"]
            PS["ProductService\n- Catalog CRUD\n- Real-time search"]
            SS["SaleService\n- @Transactional Checkout\n- Stock Validation\n- Snapshot Unit Pricing\n- Atomic Stock Decrement"]
        end

        subgraph Repos["Data Access Layer (Spring Data JPA)"]
            PR["ProductRepository"]
            SR["SaleRepository"]
            SIR["SaleItemRepository"]
        end

        API --> Middleware
        Middleware --> ServiceLayer
        ServiceLayer --> Repos
    end

    subgraph DatabaseTier["Database Tier (MySQL)"]
        DB[(MySQL 8.0\npos_db)]
        T_Prod[products table]
        T_Sale[sales table]
        T_Item[sale_items table]

        DB --- T_Prod
        DB --- T_Sale
        DB --- T_Item
    end

    Axios -->|"HTTP POST/GET/PUT/DELETE\n(JSON Payload)"| API
    BackendTier -.->|"Register & Renew Lease (HTTP: 8761)"| Eureka
    Repos -->|"HikariCP JDBC Connection Pool"| DB
```

---

## 3. Transactional Checkout Sequence Diagram

This diagram demonstrates the atomic transaction behavior when placing an order:

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Cashier / POS User
    participant Frontend as React POS Cart
    participant Controller as SaleController
    participant Service as SaleService (@Transactional)
    participant ProdRepo as ProductRepository
    participant SaleRepo as SaleRepository
    participant MySQL as MySQL Database (pos_db)

    Cashier->>Frontend: Click "Complete Sale"
    Frontend->>Controller: POST /api/sales { items: [{ productId, quantity }] }
    Controller->>Service: createSale(SaleRequest)
    
    rect rgb(240, 248, 255)
        Note over Service,MySQL: Database Transaction Scope (@Transactional)
        
        loop For each item in request
            Service->>ProdRepo: findById(productId)
            ProdRepo->>MySQL: SELECT * FROM products WHERE id = ?
            MySQL-->>ProdRepo: Product Record
            ProdRepo-->>Service: Product Entity
            
            alt Stock Quantity < Requested Quantity
                Service-->>Controller: throw InsufficientStockException
                Note over Service,MySQL: TRANSACTION ROLLBACK (Zero changes persisted)
                Controller-->>Frontend: 400 Bad Request ("Insufficient stock...")
                Frontend-->>Cashier: Display Error Alert
            else Sufficient Stock
                Service->>Service: Deduct stock (stock - quantity)
                Service->>ProdRepo: save(product)
                Service->>Service: Capture immutable snapshot unitPrice
                Service->>Service: Subtotal = unitPrice * quantity
            end
        end
        
        Service->>Service: Calculate Total = sum(subtotals)
        Service->>SaleRepo: save(sale + saleItems)
        SaleRepo->>MySQL: INSERT INTO sales, sale_items, UPDATE products
        MySQL-->>SaleRepo: Transaction Success
        Note over Service,MySQL: TRANSACTION COMMIT
    end

    Service-->>Controller: SaleResponse (DTO)
    Controller-->>Frontend: 201 Created (Sale JSON)
    Frontend->>Cashier: Render Printable Receipt Modal & Clear Cart
```

---

## 4. Entity-Relationship Diagram (Database Schema)

```mermaid
erDiagram
    PRODUCT ||--o{ SALE_ITEM : "contains"
    SALE ||--|{ SALE_ITEM : "includes"

    PRODUCT {
        bigint id PK "Auto Increment"
        varchar name "NOT NULL"
        decimal price "NOT NULL (10,2)"
        int stock_quantity "NOT NULL, Min: 0"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    SALE {
        bigint id PK "Auto Increment"
        decimal total_amount "NOT NULL (10,2)"
        datetime created_at "Timestamp"
    }

    SALE_ITEM {
        bigint id PK "Auto Increment"
        bigint product_id FK "References products(id)"
        bigint sale_id FK "References sales(id)"
        int quantity "NOT NULL, Min: 1"
        decimal unit_price "NOT NULL (10,2) - Snapshot Price"
    }
```

---

## 5. PlantUML Source Code (For PlantUML / PlantText / VS Code PlantUML)

```plantuml
@startuml Sparknity_POS_Architecture
skinparam componentStyle rectangle
skinparam roundcorner 6
skinparam shadowing false
skinparam defaultFontName Arial

package "Client Layer (localhost:5173)" {
  [React 19 + Vite] as React
  [Axios REST Client] as Axios
  React --> Axios
}

package "Service Discovery (localhost:8761)" {
  [Netflix Eureka Server] as Eureka
}

package "Backend Service - pos-service (localhost:8080)" {
  [ProductController] as PC
  [SaleController] as SC
  [OpenAPI / Swagger] as Swagger
  [ProductService] as PS
  [SaleService] as SS
  [ProductRepository] as PR
  [SaleRepository] as SR
  [SaleItemRepository] as SIR
  
  PC --> PS
  SC --> SS
  PS --> PR
  SS --> PR
  SS --> SR
  SS --> SIR
}

database "MySQL Database (localhost:3306)" {
  folder "pos_db" {
    [products]
    [sales]
    [sale_items]
  }
}

Axios --> PC : HTTP JSON
Axios --> SC : HTTP JSON
SS ..> Eureka : Service Registration (UP)
PR --> [products] : JDBC
SR --> [sales] : JDBC
SIR --> [sale_items] : JDBC
@enduml
```

---

## 6. Visual Generation Prompt (For Image Generators / Diagram Designers)

If generating a graphic using AI image tools (like Midjourney, DALL-E, Ideogram) or handing this to a technical illustrator, use the following prompt:

```text
A clean, modern, enterprise software architecture diagram infographic for "Sparknity POS".
Technical 2D schematic diagram with flat vector aesthetics on a crisp white background.
The diagram is organized into four distinct horizontal and vertical tiers:

1. Top Left: "React Frontend (Port: 5173)" showing UI modules (Dashboard, POS Register, Products Catalog, Sales History) connecting through an Axios REST client.
2. Center: "Spring Boot POS Service (Port: 8080, Java 25)" containing REST Controllers, Validation, Business Services (ProductService and Transactional SaleService), and Spring Data JPA Repositories.
3. Top Right: "Netflix Eureka Server (Port: 8761)" with a heartbeat registration connection labeled "Service Discovery: pos-service (UP)".
4. Bottom: "MySQL Database (Port: 3306, pos_db)" showing relational tables: "products", "sales", and "sale_items".

Style: Professional system engineering diagram, subtle neutral gray cards, navy and royal blue accents, crisp connecting arrows, clearly labeled ports and HTTP REST communication protocols, high legibility, clean sans-serif typography.
```
