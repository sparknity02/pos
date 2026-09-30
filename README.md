# Sparknity POS

Point of Sale and Billing Management System.

Simple. Fast. Reliable.

A full-stack Point of Sale (POS) and inventory management system built with Java 25, Spring Boot, Spring Data JPA, MySQL, Netflix Eureka, and React.

---

## Architecture

![Sparknity POS System Architecture](docs/architecture.jpg)

```text
                  +--------------------------+
                  |      React Frontend      |
                  |       Sparknity POS      |
                  |                          |
                  | Dashboard                |
                  | Products Management      |
                  | Billing Register & Cart  |
                  | Sales History            |
                  +------------+-------------+
                               |
                         Axios / REST
                         JSON Requests
                               |
                               v
                  +--------------------------+
                  |       POS Service        |
                  |       Spring Boot        |
                  |                          |
                  | Controllers              |
                  | DTOs                     |
                  | Services                 |
                  | Repositories             |
                  | JPA Entities             |
                  | Validation               |
                  | Global Exception Handler |
                  +------------+-------------+
                               |
                         JPA / Hibernate
                               |
                               v
                    +--------------------+
                    |       MySQL        |
                    |       pos_db       |
                    +--------------------+

                               ^
                               | Service Registration
                               |
                    +--------------------+
                    |   Eureka Server    |
                    |       :8761        |
                    +--------------------+
```

---

## Features

- **POS Billing Register**: Add catalog products to an active ticket, increment/decrement quantities with stock limits, calculate line subtotals, and complete orders.
- **Transactional Sale Processing**: Checkout logic is wrapped in `@Transactional(rollbackFor = Exception.class)`. If any line item is invalid or stock is insufficient, the entire sale rolls back and no inventory is deducted.
- **Historical Unit Price Invariance**: `unitPrice` is stored directly on `SaleItem` records at the time of purchase, preserving accounting accuracy regardless of future product price changes.
- **Product Catalog Management**: Complete CRUD operations for products, including real-time search, stock status badges (In Stock, Low Stock, Out of Stock), and validation rules.
- **Sales History and Receipts**: Transaction audit log with printable customer receipt vouchers.
- **Dashboard Overview**: KPI summary cards for total products, low-stock alerts, total orders, and today's accumulated revenue.
- **Service Discovery**: The backend registers with Netflix Eureka as `pos-service` on port 8080.
- **OpenAPI / Swagger UI**: Interactive API documentation for all REST endpoints.
- **Automated Unit Testing**: 15 unit tests covering business logic, stock deductions, boundary conditions, and transactional integrity.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| Language | Java 25 | OpenJDK 25 |
| Backend | Spring Boot | 4.1.1 (Spring Web MVC, Validation, DevTools) |
| Persistence | Spring Data JPA / Hibernate | MySQL Dialect |
| Database | MySQL | 8.0 (`pos_db`) |
| Service Discovery | Netflix Eureka | Spring Cloud Eureka Server & Client |
| API Docs | Springdoc OpenAPI | Swagger UI 3.1.0 |
| Frontend | React | 19.x (Vite bundler) |
| HTTP Client | Axios | Centralized API client |
| Routing | React Router DOM | Client-side routing |
| Testing | JUnit 5 & Mockito | Service layer unit tests |

---

## Database Design

```text
                    +-------------------------+
                    |         Product         |
                    +-------------------------+
                    | id (PK)                 |
                    | name                    |
                    | price                   |
                    | stockQuantity           |
                    | createdAt               |
                    | updatedAt               |
                    +------------+------------+
                                 |
                                 | 1 : N
                                 v
                    +-------------------------+
                    |        SaleItem         |
                    +-------------------------+
                    | id (PK)                 |
                    | quantity                |
                    | unitPrice (Snapshot)    |
                    | product_id (FK)         |
                    | sale_id (FK)            |
                    +------------+------------+
                                 |
                                 | N : 1
                                 v
                    +-------------------------+
                    |          Sale           |
                    +-------------------------+
                    | id (PK)                 |
                    | totalAmount             |
                    | createdAt               |
                    +-------------------------+
```

---

## Default Ports

| Service | Port | URL |
|---|---|---|
| MySQL | 3306 | `localhost:3306` |
| Eureka Server | 8761 | http://localhost:8761 |
| POS Backend | 8080 | http://localhost:8080 |
| Swagger UI | 8080 | http://localhost:8080/swagger-ui/index.html |
| React Frontend | 5173 | http://localhost:5173 |

---

## Getting Started

### 1. Prerequisites
- Java 25 JDK
- Node.js (v18+) and npm
- MySQL Server (running locally on port 3306)

### 2. Database Setup
Log in to MySQL and create the database:
```sql
CREATE DATABASE IF NOT EXISTS pos_db;
```

The backend connects using default credentials `root` / `root`. To customize credentials, set environment variables:
```bash
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```
*(On Windows PowerShell, use `$env:DB_USERNAME="your_username"`).*

### 3. Start Eureka Server
In a new terminal:
```bash
cd eureka-server

# Unix / macOS
./mvnw spring-boot:run

# Windows
.\mvnw.cmd spring-boot:run
```
Verify the Eureka dashboard is accessible at: `http://localhost:8761`

### 4. Start POS Backend
In a separate terminal:
```bash
cd backend

# Unix / macOS
./mvnw spring-boot:run

# Windows
.\mvnw.cmd spring-boot:run
```
On initial boot, sample catalog products will automatically seed if the database is empty.  
Access Swagger documentation at: `http://localhost:8080/swagger-ui/index.html`

### 5. Start React Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Running Tests

Execute the unit test suite in `backend/`:
```bash
cd backend

# Unix / macOS
./mvnw test

# Windows
.\mvnw.cmd test
```

### Test Suite Summary
- `ProductServiceTest`:
  - `testCreateProduct`: Validates product persistence and DTO mapping.
  - `testGetProductById_Success`: Retrieves existing product by ID.
  - `testGetProductById_NotFound`: Expects `ResourceNotFoundException`.
  - `testUpdateProduct_Success`: Updates fields and verifies changes.
  - `testDeleteProduct_Success`: Deletes product when exists.
  - `testDeleteProduct_NotFound`: Rejects deletion for missing ID.
  - `testGetProducts_WithSearch`: Verifies case-insensitive search queries.
- `SaleServiceTest`:
  - `testCreateSale_Success`: Verifies subtotal calculation, total sum, and inventory stock reduction.
  - `testCreateSale_ProductNotFound`: Rejects checkout if an item ID does not exist.
  - `testCreateSale_InsufficientStock`: Rejects sale when requested quantity exceeds available stock and ensures stock is unchanged.
  - `testCreateSale_EmptyItems`: Validates non-empty item list requirement.
  - `testGetSaleById_Success` & `testGetSaleById_NotFound`: Tests receipt lookup by ID.
  - `testGetDashboardStats`: Verifies KPI count and revenue aggregation.

---

## REST API Endpoints

### Products (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products or paginated (`?page=0&size=10&search=...`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `POST` | `/api/products` | Create a new product (201 Created) |
| `PUT` | `/api/products/{id}` | Update product details |
| `DELETE` | `/api/products/{id}` | Delete product by ID (204 No Content) |

### Sales (`/api/sales`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sales` | Create transactional sale order and deduct stock (201 Created) |
| `GET` | `/api/sales` | Retrieve sale transaction history |
| `GET` | `/api/sales/{id}` | Retrieve detailed receipt for a sale |
| `GET` | `/api/sales/stats` | Retrieve dashboard KPI counts and revenue metrics |

---

## Transactional Integrity Scenario

To verify that atomic transaction rollback functions correctly:
1. Product A has stock = 10.
2. Product B has stock = 1.
3. Place an order requesting 2 units of A and 5 units of B:
   ```json
   {
     "items": [
       { "productId": 1, "quantity": 2 },
       { "productId": 2, "quantity": 5 }
     ]
   }
   ```
4. Expected result: HTTP 400 Bad Request with message `Insufficient stock for product: Product B`.
5. Database state: Product A remains at stock 10; Product B remains at stock 1. No partial stock deductions occur.

---

## License
MIT License.
