<p align="center">
  <img src="https://img.shields.io/badge/Kafka-Studio-7c3aed?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka Studio" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Azure_OpenAI-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white" alt="Azure OpenAI" />
  <img src="https://img.shields.io/badge/Azure_AKS-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="AKS" />
</p>

<h1 align="center">
  <br />
   Kafka Studio
  <br />
  <sub>A Modern Kafka Management & Testing Interface</sub>
</h1>

<p align="center">
  <b>Kafka Studio</b> is a sleek, local web application for managing Apache Kafka topics and producing messages — powered by AI-generated mock data via Azure OpenAI. Deploy your Kafka cluster on Azure AKS with the included infrastructure scripts.
</p>

---

## Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [AKS Kafka Deployment](#-aks-kafka-deployment)
- [Kafka → Databricks Streaming Pipeline](#-kafka--databricks-streaming-pipeline)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## Overview

Kafka Studio provides a beautiful glassmorphism UI to interact with your Kafka cluster. Whether you're developing, debugging, or testing Kafka-based microservices, this tool lets you:

- **Browse & create** Kafka topics
- **Produce messages** with custom JSON payloads
- **Generate mock data** using Azure OpenAI (GPT) for realistic test payloads
- **Deploy Kafka** on Azure Kubernetes Service (AKS) using Strimzi

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KAFKA STUDIO                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────────────┐         ┌───────────────────────────────┐   │
│   │                   │  HTTP   │                               │   │
│   │   Frontend        │ ──────> │   Backend (FastAPI)           │   │
│   │                   │  :8001  │                        :8000  │   │
│   │  ┌─────────────┐  │         │  ┌─────────────────────────┐  │   │
│   │  │ Topic List  │  │         │  │  /api/config            │  │   │
│   │  │ Sidebar     │  │         │  │  /api/topics     (CRUD) │  │   │
│   │  ├─────────────┤  │         │  │  /api/produce    (Send) │  │   │
│   │  │ Message     │  │         │  │  /api/mock-data  (AI)   │  │   │
│   │  │ Producer    │  │         │  └──────┬──────────┬───────┘  │   │
│   │  ├─────────────┤  │         │         │          │          │   │
│   │  │ Mock Data   │  │         │         ▼          ▼          │   │
│   │  │ Generator   │  │         │  ┌──────────┐ ┌──────────┐    │   │
│   │  └─────────────┘  │         │  │  Kafka   │ │  Azure   │    │   │
│   │                   │         │  │  Broker  │ │  OpenAI  │    │   │
│   │  HTML/CSS/JS      │         │  └──────────┘ └──────────┘    │   │
│   └───────────────────┘         └───────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────┐    1. Select Topic     ┌──────────┐    2. Fetch/Create   ┌─────────────┐
│ User │ ─────────────────────> │ Frontend │ ──────────────────── │   Backend   │
│      │                        │  :8001   │                      │   :8000     │
│      │    6. Notification     │          │    5. Response       │             │
│      │ <───────────────────── │          │ <─────────────────── │             │
└──────┘                        └──────────┘                      └──────┬──────┘
                                                                         │
                                                          3. Produce     │  4. AI Generate
                                                             Message     │     Mock Data
                                                                         │
                                                                    ┌────▼────┐
                                                                    │  Kafka  │
                                                                    │ Cluster │
                                                                    └─────────┘
```

### Infrastructure (Azure AKS)

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud                          │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │           Azure Kubernetes Service (AKS)        │   │
│   │                                                 │   │
│   │   ┌──────────────┐    ┌──────────────────────┐  │   │
│   │   │   Strimzi    │    │   Kafka Cluster      │  │   │
│   │   │   Operator   │───>│                      │  │   │
│   │   │              │    │  ┌────┐ ┌────┐ ┌────┐│  │   │
│   │   └──────────────┘    │  │ B1 │ │ B2 │ │ B3 ││  │   │
│   │                       │  └────┘ └────┘ └────┘│  │   │
│   │                       │     Kafka Brokers    │  │   │
│   │                       └──────────────────────┘  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌──────────────┐              ┌──────────────────┐    │
│   │ Azure Key    │              │  Azure OpenAI    │    │
│   │ Vault        │              │  (GPT-5.4-pro)   │    │
│   │ (Secrets)    │              │  Mock Data Gen   │    │
│   └──────────────┘              └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---|---|
| **Topic Management** | List, create, and refresh Kafka topics with configurable partitions and replication factor |
| **Message Producer** | Send JSON messages with optional keys to any selected topic |
| **AI Mock Data** | Generate realistic test payloads using Azure OpenAI based on the topic name |
| **Connection Monitor** | Real-time status indicator showing Kafka broker connectivity |
| **Glassmorphism UI** | Dark theme with frosted glass panels, animated gradient orbs, and smooth transitions |
| **AKS Deployment** | Full infrastructure scripts to deploy a Kafka cluster on Azure Kubernetes Service |
| **One-Command Launch** | Start both frontend and backend with a single `./run.sh` |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.9+** | Runtime |
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **kafka-python-ng** | Kafka client (admin + producer) |
| **Pydantic** | Request/response validation |
| **python-dotenv** | Environment configuration |
| **Requests** | HTTP client for Azure OpenAI |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Structure |
| **CSS3** | Glassmorphism styling with CSS variables |
| **Vanilla JS** | Fetch API, DOM manipulation |
| **Inter Font** | Typography (Google Fonts) |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Azure AKS** | Managed Kubernetes |
| **Strimzi** | Kafka operator for Kubernetes |
| **Azure Key Vault** | Secrets management |
| **Azure CLI / kubectl** | Cluster provisioning scripts |

---

## Project Structure

```
run-aks-kafka-website/
│
├── frontend/                    # Client-side web application
│   ├── index.html               #   Main HTML — layout & modals
│   ├── style.css                #   Glassmorphism theme & animations
│   └── app.js                   #   API calls, state, & event handlers
│
├── backend/                     # FastAPI server
│   ├── main.py                  #   API routes & Kafka/OpenAI integration
│   ├── requirements.txt         #   Python dependencies
│   ├── .env                     #   Environment config (not committed)
│   └── .env.example             #   Template for environment variables
│
├── kafka-aks copy/              # Azure AKS + Kafka infrastructure
│   ├── create-aks.sh            #   Provision AKS cluster
│   ├── start-aks.sh             #   Start the AKS cluster
│   ├── stop-aks.sh              #   Stop the AKS cluster
│   ├── kafka-cluster.yaml       #   Strimzi Kafka CRD manifest
│   ├── kafka-cluster-pathY.yaml #   Alternative cluster config
│   ├── create-databricks-user.yaml  # Databricks user manifest
│   ├── create-keyvault-secrets.sh   # Push secrets to Azure Key Vault
│   └── get-databricks-secret-certs.sh # Retrieve certs from Databricks
│
├── venv/                        # Python virtual environment
├── run.sh                       # Start both servers (backend + frontend)
├── stop_website.sh              # Kill running servers
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Python 3.9+**
- **A running Kafka broker** (local or remote)
- **Azure OpenAI access** *(optional — only for AI mock data)*

### 1. Clone & Setup

```bash
git clone <repository-url>
cd run-aks-kafka-website

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your Kafka broker details:

```env
# Kafka Connection
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_SECURITY_PROTOCOL=PLAINTEXT

# (Optional) For SASL_SSL authentication
KAFKA_SASL_MECHANISM=PLAIN
KAFKA_SASL_USERNAME=your_username
KAFKA_SASL_PASSWORD=your_password

# (Optional) For AI mock data generation
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/...
AZURE_OPENAI_API_KEY=your_api_key
```

### 3. Launch

```bash
chmod +x run.sh
./run.sh
```

```
======================================
Servers are running!
Backend API: http://127.0.0.1:8000
Frontend:    http://127.0.0.1:8001
Press Ctrl+C to stop both servers.
======================================
```

Open **http://127.0.0.1:8001** in your browser.

### 4. Stop

Press `Ctrl+C` in the terminal, or run:

```bash
./stop_website.sh
```

---

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `KAFKA_BOOTSTRAP_SERVERS` | Yes | — | Comma-separated broker addresses |
| `KAFKA_SECURITY_PROTOCOL` | No | `PLAINTEXT` | `PLAINTEXT` or `SASL_SSL` |
| `KAFKA_SASL_MECHANISM` | No | `PLAIN` | `PLAIN`, `SCRAM-SHA-256`, or `SCRAM-SHA-512` |
| `KAFKA_SASL_USERNAME` | No | — | SASL username (when using `SASL_SSL`) |
| `KAFKA_SASL_PASSWORD` | No | — | SASL password (when using `SASL_SSL`) |
| `KAFKA_SSL_CA_LOCATION` | No | — | Path to CA certificate file |
| `AZURE_OPENAI_ENDPOINT` | No | — | Azure OpenAI API endpoint URL |
| `AZURE_OPENAI_API_KEY` | No | — | Azure OpenAI API key |

---

## AKS Kafka Deployment

The `kafka-aks copy/` directory contains scripts to provision a full Kafka cluster on Azure:

```
Step 1                  Step 2                  Step 3
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  create-aks  │ ─────> │  start-aks   │ ─────> │  Apply YAML  │
│  .sh         │        │  .sh         │        │  manifests   │
│              │        │              │        │              │
│ Provisions   │        │ Starts the   │        │ Deploys      │
│ AKS cluster  │        │ cluster &    │        │ Strimzi +    │
│ on Azure     │        │ installs     │        │ Kafka CRD    │
│              │        │ Strimzi      │        │              │
└──────────────┘        └──────────────┘        └──────────────┘
```

```bash
# 1. Create the AKS cluster
cd "kafka-aks copy"
./create-aks.sh

# 2. Start and install Strimzi operator
./start-aks.sh

# 3. Deploy Kafka cluster
kubectl apply -f kafka-cluster.yaml

# 4. Store secrets in Key Vault
./create-keyvault-secrets.sh

# To stop the cluster
./stop-aks.sh
```

---

## Kafka → Databricks Streaming Pipeline

This project includes a fully working end-to-end streaming pipeline that takes messages produced through Kafka Studio and streams them into **Azure Databricks** via Spark Structured Streaming — with all credentials secured in Azure Key Vault.

### Pipeline Architecture

```
Producer (Kafka Studio / kubectl console)
      │
      ▼
┌──────────────────────────────────────────────┐
│ AKS cluster (3 nodes, Standard_D4s_v5)       │
│                                              │
│  Strimzi operator (KRaft mode)               │
│  ├─ 3 controllers (metadata quorum)          │
│  └─ 3 brokers (RF=3, min ISR=2)             │
│                                              │
│  Listeners:                                  │
│  - internal 9092 (plain)                     │
│  - internal 9093 (tls)                       │
│  - external 9094 (LoadBalancer,              │
│    TLS + SCRAM-SHA-512)                      │
└──────────────────────────────────────────────┘
      │  public LB IPs · TLS+SCRAM · internet
      ▼
┌──────────────────────────────────────────────┐
│ Azure Databricks (classic workspace)         │
│  - All-purpose cluster (Dedicated mode)      │
│  - Structured Streaming readStream           │
│  - Secrets pulled from Key Vault             │
└──────────────────────────────────────────────┘
      Azure Key Vault (fordatabrickskv1)
      ├─ kafka-scram-password
      └─ kafka-ca-cert
```

### Key Design Decisions

| Decision | Reason |
|---|---|
| **Self-managed Kafka, not Event Hubs** | Event Hubs hides the broker/controller topology; self-managed gives real multi-broker KRaft control |
| **KRaft mode (no ZooKeeper)** | ZooKeeper is deprecated/removed in current Strimzi; dedicated controller nodes hold cluster metadata |
| **TLS + SCRAM-SHA-512, not mTLS** | Username/password over TLS is far easier to wire into Databricks than client-cert keystores |
| **LoadBalancer listener, not NodePort** | Azure provisions stable public IPs; NodePort is fragile when nodes recycle |
| **Key Vault-backed secret scope** | Keeps password + CA cert out of the notebook; pulled at runtime via `dbutils.secrets.get()` |
| **Dedicated-mode Databricks cluster** | Standard (shared) mode restricts filesystem/Spark configs required for Kafka SSL setup |

### Build Steps

The pipeline was built in two phases — internal first, then external — to isolate failures:

1. **Build AKS cluster** — resource group `rg-kafka-lab` (centralindia), Kubernetes 1.34.5, `--tier free`
2. **Install Strimzi operator** — deploy CRDs into the `kafka` namespace
3. **Deploy Kafka (Path X — internal only)** — Kafka 4.2.0, `metadataVersion 4.2-IV1`, RF=3, min ISR=2
4. **Verify internally** — console producer + consumer as throwaway pods; cluster proven before any external exposure
5. **Add external listener (Path Y)** — port 9094, type `loadbalancer`, TLS + SCRAM-SHA-512; rolling broker restart
6. **Create the Kafka user** — `KafkaUser databricks-user` with `scram-sha-512` authentication
7. **Extract secrets** — pull CA cert and SCRAM password from Kubernetes secrets
8. **Store in Key Vault** — vault `fordatabrickskv1` (RBAC model), secrets `kafka-scram-password` and `kafka-ca-cert`
9. **Grant Databricks read access** — Key Vault Secrets User role on the global `AzureDatabricks` app
10. **Create secret scope** — scope `kafka-secrets` backed by the Key Vault URI
11. **Verify secrets** — confirmed PEM round-tripped intact before connecting to Kafka
12. **Run the stream** — `spark.readStream.format("kafka")` with SASL_SSL, streaming table populated

### Databricks Structured Streaming Code

```python
KAFKA_BOOTSTRAP = "<bootstrap-LB-IP>:9094"
KAFKA_USER = "databricks-user"
KAFKA_PASSWORD = dbutils.secrets.get(scope="kafka-secrets", key="kafka-scram-password")
CA_CERT = dbutils.secrets.get(scope="kafka-secrets", key="kafka-ca-cert")

kafka_options = {
    "kafka.bootstrap.servers": KAFKA_BOOTSTRAP,
    "subscribe": "my-topic",
    "kafka.security.protocol": "SASL_SSL",
    "kafka.sasl.mechanism": "SCRAM-SHA-512",
    "kafka.sasl.jaas.config": (
        "kafkashaded.org.apache.kafka.common.security.scram.ScramLoginModule "
        f'required username="{KAFKA_USER}" password="{KAFKA_PASSWORD}";'
    ),
    "kafka.ssl.truststore.type": "PEM",
    "kafka.ssl.truststore.certificates": CA_CERT,
    "startingOffsets": "earliest",
    "failOnDataLoss": "false",
}

df = spark.readStream.format("kafka").options(**kafka_options).load()
parsed = df.select(
    col("key").cast("string"), col("value").cast("string"),
    "topic", "partition", "offset", "timestamp",
)
display(parsed)
```

> **Critical:** The JAAS module must use the shaded class name `kafkashaded.org.apache.kafka.common.security.scram.ScramLoginModule` — the plain `org.apache.kafka…` name fails on Databricks.
>
> **SSL handshake failure:** If you connect via raw IP, add `"kafka.ssl.endpoint.identification.algorithm": ""` — Strimzi broker certs are issued to hostnames, not IPs.

### Cost Management

Three independent billing meters run on Azure:

| Resource | Notes |
|---|---|
| **AKS worker VMs** | Stop with `az aks stop` (disk storage still billed) |
| **LoadBalancer public IPs** | Billed even when AKS is stopped — only free after `az group delete` |
| **Databricks DBUs** | Billed while cluster runs — enable auto-terminate |

```bash
az aks stop --resource-group rg-kafka-lab --name aks-kafka-lab  # stop VMs
az group delete --name rg-kafka-lab                              # full teardown
```

### Next Steps

- [ ] Persist stream to Unity Catalog — `writeStream` to a UC-managed Delta table (bronze layer) with a checkpoint
- [ ] Build a medallion pipeline — Bronze → Silver → Gold transformations
- [ ] Rebuild as a Lakeflow Declarative Pipeline (DLT) — compare against raw Structured Streaming
- [ ] Enable cluster-level authorization — add a Kafka authorizer with scoped ACLs on the `KafkaUser`

---

## API Reference

### `GET /api/config`

Check Kafka connection status.

**Response:**
```json
{
  "status": "configured",
  "servers": "localhost:9092",
  "protocol": "PLAINTEXT"
}
```

---

### `GET /api/topics`

List all non-internal Kafka topics.

**Response:**
```json
{
  "topics": ["orders", "payments", "user-events"]
}
```

---

### `POST /api/topics`

Create a new Kafka topic.

**Request:**
```json
{
  "topic_name": "my-new-topic",
  "num_partitions": 3,
  "replication_factor": 1
}
```

**Response:**
```json
{
  "message": "Topic 'my-new-topic' created successfully."
}
```

---

### `POST /api/produce`

Produce a message to a Kafka topic.

**Request:**
```json
{
  "topic": "orders",
  "key": "order-456",
  "value": {
    "item": "laptop",
    "quantity": 1,
    "price": 999.99
  }
}
```

**Response:**
```json
{
  "message": "Message produced successfully."
}
```

---

### `POST /api/mock-data`

Generate AI-powered mock data for a topic.

**Request:**
```json
{
  "topic": "user-signups"
}
```

**Response:**
```json
{
  "key": "user-8a3f",
  "value": {
    "user_id": "8a3f-...",
    "email": "jane@example.com",
    "plan": "premium",
    "signed_up_at": "2025-03-15T10:30:00Z"
  }
}
```

---

## Screenshots

> Launch the app and visit **http://127.0.0.1:8001** to see:
>
> - Dark glassmorphism interface with animated purple & cyan gradient orbs
> - Left sidebar listing all Kafka topics
> - Main panel with message key input, JSON payload editor, and send button
> - "Generate Mock Data" powered by Azure OpenAI
> - Toast notifications for success and error states

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with FastAPI, Kafka, and Azure OpenAI<br/>
  <sub>Kafka Studio &mdash; Test smarter, ship faster.</sub>
</p>
