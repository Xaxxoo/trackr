# trkr

**On-chain Inventory & Production Management for Manufacturing**

ChainSupply is a **production-grade inventory management platform** designed for manufacturing companies and powered by **EVM smart contracts deployed on Base**.

It bridges **real-world manufacturing workflows** (raw materials → production → finished goods → distribution) with **on-chain transparency, auditability, and trust**.


## Why ChainSupply?

Traditional inventory systems are:

* Opaque
* Easy to manipulate
* Hard to audit
* Fragmented across teams

ChainSupply brings **verifiable inventory records on-chain**, ensuring:

* Immutable stock movement history
* Transparent production tracking
* Tamper-proof audit trails
* Real-time visibility across warehouses

Built specifically with **manufacturing at scale** in mind (cotton wool, diapers, sanitary pads).


## Architecture Overview

ChainSupply is a **hybrid on-chain + off-chain system**:

### On-Chain (Base Network)

* Immutable inventory events
* Batch creation & production records
* Stock movement proofs
* Role & permission anchors
* Audit trail guarantees

### Off-Chain

* High-performance APIs
* Business logic & validations
* Reporting & analytics
* User experience & dashboards

This approach keeps gas costs low while preserving trust guarantees.


## Tech Stack

### Blockchain

* **Network:** Base (Ethereum L2)
* **VM:** EVM
* **Smart Contracts:** Solidity
* **Wallets:** MetaMask, WalletConnect
* **Indexing:** Custom event indexing (future support for The Graph)

### Backend

* **Framework:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Auth:** JWT + Role-Based Access Control
* **Blockchain Integration:** Ethers.js

### Frontend

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **UI:** Modern component-driven architecture
* **State Management:** Server Components + client state where needed


## Manufacturing Use Case

ChainSupply supports end-to-end manufacturing workflows:

### Raw Materials

* Pulp
* Chemicals
* Non-woven fabric
* Elastic materials
* Packaging

### Production

* Batch-based production
* Bill of Materials (BOM)
* Material consumption tracking
* Output verification on-chain

### Finished Goods

* Cotton wool
* Diapers (variants & sizes)
* Sanitary pads (variants & sizes)
* SKU & batch tracking

### Warehousing

* Multi-warehouse support
* Stock transfers
* Adjustments & reconciliation
* Low-stock alerts


## Roles & Permissions

* **Admin** – Full system access
* **Inventory Manager** – Stock & warehouse control
* **Production Manager** – Batch & BOM management
* **Sales** – Outbound stock & distribution

Critical actions are **anchored on-chain** for auditability.


## Core Features

*  On-chain inventory event logging
*  Batch-based production tracking
*  Multi-warehouse stock management
*  Immutable audit trail
*  Role-based access control
*  Real-time stock visibility
*  Gas-efficient event design
*  Advanced analytics (coming soon)
*  Supplier on-boarding (coming soon)


##  Smart Contracts

Contracts are deployed on **Base** and handle:

* Inventory movement events
* Batch creation records
* Production confirmations
* Role assignments
* Audit references

Contracts are designed to be:

* Minimal
* Gas-efficient
* Upgrade-safe (via versioned deployments)

 Business logic lives off-chain. The chain is used as the **source of truth**, not a computation engine.


## Getting Started

### Prerequisites

* Node.js ≥ 18
* PostgreSQL
* MetaMask wallet
* Base network RPC

### Install Dependencies

```bash
pnpm install
```

### Backend

```bash
cd backend
pnpm start:dev
```

### Frontend

```bash
cd frontend
pnpm dev
```


## 🔗 Network Configuration

* **Network:** Base
* **Chain ID:** 8453
* **Currency:** ETH
* **Explorer:** Basescan

Contracts are deployed and verified on Base.


## Auditing & Transparency

Every critical inventory action emits an **on-chain event**:

* Stock In
* Stock Out
* Transfers
* Production Batches
* Adjustments

This enables:

* Independent verification
* Regulatory audits
* Dispute resolution
* Trustless reporting


## Testing

* Unit tests for smart contracts
* Integration tests for backend
* Role-based flow testing
* Event indexing validation


## Roadmap

*  Supplier onboarding on-chain
*  DAO-based governance for factories
*  Zero-knowledge inventory proofs
*  Multi-chain expansion
*  ERP integrations


## 📄 License

MIT License
