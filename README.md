# Sparknity POS

> **Simple. Fast. Reliable.**

A high-performance, clean, full-stack Point of Sale (POS) and Billing Management System built with **Java 25**, **Spring Boot**, **MySQL**, **Spring Data JPA/Hibernate**, **Netflix Eureka Service Discovery**, **Springdoc OpenAPI (Swagger)**, and **React + Vite**.

Designed for small-to-medium businesses requiring fast checkout, transactional stock reduction, reliable billing history, and robust service discovery.

---

## 🏗 High-Level Architecture

```text
                  ┌──────────────────────────┐
                  │       React Frontend     │
                  │        Sparknity POS     │
                  │                          │
                  │ Dashboard                │
                  │ Products Management      │
                  │ Billing Terminal & Cart  │
                  │ Sales History            │
                  └────────────┬─────────────┘
                               │
                         Axios / REST
                         JSON Request
                               │
                               ▼
                  ┌──────────────────────────┐
                  │    POS Service           │
                  │    Spring Boot           │
                  │                          │
                  │ Controllers              │
                  │ DTOs                     │
                  │ Services                  │
                  │ Repositories              │
                  │ JPA Entities              │
                  │ Validation                │
                  │ Exception Handling        │
                  └────────────┬─────────────┘
                               │
                         JPA / Hibernate
                               │
                               ▼
                    ┌────────────────────┐
                    │       MySQL        │
                    │       pos_db        │
                    └────────────────────┘

                               ▲
                               │
                       Service Discovery
                               │
                    ┌────────────────────┐
                    │   Eureka Server    │
                    │      :8761         │
                    └────────────────────┘
```

---

## ✨ Features

- **⚡ Fast POS Billing Cart**: Select items, dynamically increase/decrease quantities, enforce real-time maximum stock ceilings, and calculate line subtotals & grand totals.
- **🛡 @Transactional Order Placement**: Multi-product checkout executed within an atomic database transaction. If any item is out of stock or fails validation, the entire transaction rolls back—preventing partial stock updates.
- **🏷 Historical Price Invariance**: `unitPrice` is stored as an immutable snapshot in `SaleItem` at the exact moment of purchase, preserving accounting accuracy regardless of future product price changes.
- **📦 Complete Product CRUD**: Add, edit, search, and delete catalog products with stock badges (In Stock, Low Stock, Out of Stock).
- **🧾 Sales History & Receipts**: Itemized audit log with instant receipt viewer and printable receipt vouchers.
- **📊 Real-time Dashboard**: Overview cards for total products, low-stock alerts (<= 5 units), total sales count, and today's accumulated revenue.
- **🌐 Eureka Service Discovery**: Backend automatically registers with Netflix Eureka as `pos-service` on port 8080.
- **📘 Swagger OpenAPI 3.0**: Interactive documentation and REST API testing playground.
- **🧪 Automated Unit Testing**: 15 unit tests covering service business logic, transactional stock updates, boundary validations, and edge cases.

---

## 🧰 Tech Stack

| Component | Technology | Version |
|---|---|---|
| **Language** | Java | 25 |
| **Backend Framework** | Spring Boot | 4.1.1 |
| **Persistence** | Spring Data JPA / Hibernate | 7.4.5 |
| **Database** | MySQL | 8.0 |
| **Service Discovery** | Netflix Eureka Client & Server | 2025.1.3 |
| **API Documentation** | Springdoc OpenAPI / Swagger UI | 3.1.0 |
| **Validation** | Jakarta Bean Validation | Default |
| **Frontend Framework** | React | 19 |
| **Bundler & Dev Server** | Vite | 8.3 |
| **HTTP Client** | Axios | 1.13 |
| **Routing** | React Router DOM | 7.3 |
| **Testing** | JUnit 5 & Mockito | Default |

---

## 🗄 Database Design

```text
                    ┌─────────────────────────┐
                    │         Product         │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ name                    │
                    │ price                   │
                    │ stockQuantity           │
                    │ createdAt               │
                    │ updatedAt               │
                    └───────────┬─────────────┘
                                │
                                │ 1 : N
                                ▼
                    ┌─────────────────────────┐
                    │        SaleItem         │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ quantity                │
                    │ unitPrice (Snapshot)    │
                    │ product_id (FK)         │
                    │ sale_id (FK)            │
                    └───────────┬─────────────┘
                                │
                                │ N : 1
                                ▼
                    ┌─────────────────────────┐
                    │          Sale           │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ totalAmount             │
                    │ createdAt               │
                    └─────────────────────────┘
```

---

## 🔌 Default Ports

| Service | Host & Port | Description |
|---|---|---|
| **MySQL** | `localhost:3306` | Database (`pos_db`) |
| **Eureka Server** | `http://localhost:8761` | Service Registry Dashboard |
| **POS Backend** | `http://localhost:8080` | Spring Boot REST API |
| **Swagger UI** | `http://localhost:8080/swagger-ui/index.html` | OpenAPI Documentation |
| **Frontend** | `http://localhost:5173` | React POS Application |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java 25 JDK**
- **Node.js 18+** & **npm**
- **MySQL Server** (running locally on port 3306)

### 2. Database Setup
Create database `pos_db`:
```sql
CREATE DATABASE IF NOT EXISTS pos_db;
```
*(Default credentials are `root`/`root`. Override via `DB_USERNAME` and `DB_PASSWORD` environment variables if needed).*

### 3. Start Eureka Server
```bash
cd eureka-server
.\mvnw.cmd spring-boot:run
```
*Access Eureka Dashboard at: `http://localhost:8761`*

### 4. Start POS Backend Service
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
*Swagger API Docs: `http://localhost:8080/swagger-ui/index.html`*  
*Automatic seed data will populate 6 initial catalog items on first run.*

### 5. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open application at: `http://localhost:5173`*

---

## 🧪 Running Unit Tests

Run the complete test suite in `backend/`:
```bash
cd backend
.\mvnw.cmd test
```

### Test Coverage Highlights:
- **ProductService**:
  - `createProduct`
  - `getProductById_Success` & `getProductById_NotFound`
  - `updateProduct_Success`
  - `deleteProduct_Success` & `deleteProduct_NotFound`
  - `getProducts_WithSearch`
- **SaleService**:
  - `createSale_Success`: Validates subtotal calculation, total sum, and real-time stock reduction.
  - `createSale_ProductNotFound`: Ensures missing items reject gracefully.
  - `createSale_InsufficientStock`: Tests transaction failure and verifies stock is not decremented.
  - `createSale_EmptyItems`: Validates payload integrity.
  - `getSaleById_Success` & `getSaleById_NotFound`
  - `getDashboardStats`: Verifies KPI aggregations.

---

## 📋 REST API Endpoints

### Products (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products or paginated (`?page=0&size=10&search=...`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `POST` | `/api/products` | Create a new product (201 Created) |
| `PUT` | `/api/products/{id}` | Update product details |
| `DELETE` | `/api/products/{id}` | Delete a product (204 No Content) |

### Sales & Billing (`/api/sales`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sales` | Create transactional sale order & reduce stock (201 Created) |
| `GET` | `/api/sales` | List all sales or paginated |
| `GET` | `/api/sales/{id}` | Get detailed sale receipt with itemized line subtotals |
| `GET` | `/api/sales/stats` | Get KPI metrics (total products, low stock, revenue) |

---

## 🔒 Transactional Integrity Demonstration

To simulate and test atomic rollback behavior:
1. Product A has stock = 10.
2. Product B has stock = 1.
3. Order requests 2 units of A and 5 units of B.
4. **Result**: HTTP 400 `Insufficient stock for product: Product B`.
5. **State**: Product A retains stock 10; Product B retains stock 1. No partial stock updates occur.

---

## 📝 License
MIT License. Developed for Sparknity POS.
