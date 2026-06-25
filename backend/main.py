import os
import json
from typing import Optional, Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from kafka import KafkaAdminClient, KafkaProducer
from kafka.admin import NewTopic
import ssl
import requests

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Kafka Web Tester API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class TopicCreate(BaseModel):
    topic_name: str
    num_partitions: int = 1
    replication_factor: int = 1

class MessageProduce(BaseModel):
    topic: str
    key: Optional[str] = None
    value: Dict[str, Any]

class MockDataRequest(BaseModel):
    topic: str

# Kafka Config Helper
def get_kafka_config():
    servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
    if not servers:
        raise HTTPException(status_code=500, detail="KAFKA_BOOTSTRAP_SERVERS is not configured in .env")

    config = {
        'bootstrap_servers': servers,
    }

    security_protocol = os.getenv("KAFKA_SECURITY_PROTOCOL", "PLAINTEXT")
    if security_protocol != "PLAINTEXT":
        config['security_protocol'] = security_protocol
        config['sasl_mechanism'] = os.getenv("KAFKA_SASL_MECHANISM", "PLAIN")
        config['sasl_plain_username'] = os.getenv("KAFKA_SASL_USERNAME")
        config['sasl_plain_password'] = os.getenv("KAFKA_SASL_PASSWORD")
        
        ca_location = os.getenv("KAFKA_SSL_CA_LOCATION")
        if ca_location:
            context = ssl.create_default_context(cafile=ca_location)
            config['ssl_context'] = context

    return config

@app.get("/api/config")
def check_config():
    try:
        config = get_kafka_config()
        return {"status": "configured", "servers": config['bootstrap_servers'], "protocol": config.get('security_protocol', 'PLAINTEXT')}
    except HTTPException as e:
        return {"status": "unconfigured", "detail": str(e.detail)}

@app.get("/api/topics")
def list_topics():
    config = get_kafka_config()
    try:
        admin_client = KafkaAdminClient(**config)
        topics = admin_client.list_topics()
        admin_client.close()
        # Filter out internal topics like __consumer_offsets if desired
        topics = [t for t in topics if not t.startswith("__")]
        return {"topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch topics: {str(e)}")

@app.post("/api/topics")
def create_topic(topic_data: TopicCreate):
    config = get_kafka_config()
    try:
        admin_client = KafkaAdminClient(**config)
        new_topic = NewTopic(
            name=topic_data.topic_name, 
            num_partitions=topic_data.num_partitions, 
            replication_factor=topic_data.replication_factor
        )
        admin_client.create_topics([new_topic])
        admin_client.close()
        return {"message": f"Topic '{topic_data.topic_name}' created successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create topic: {str(e)}")

@app.post("/api/produce")
def produce_message(msg: MessageProduce):
    config = get_kafka_config()
    try:
        producer = KafkaProducer(
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            **config
        )
        
        producer.send(
            msg.topic, 
            value=msg.value, 
            key=msg.key
        )
        producer.flush() # Wait for message to be delivered
        producer.close()
        return {"message": "Message produced successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to produce message: {str(e)}")

@app.post("/api/mock-data")
def generate_mock_data(req: MockDataRequest):
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")

    if not endpoint or not api_key:
        raise HTTPException(status_code=500, detail="Azure OpenAI credentials are not configured in .env")

    prompt = f"Generate a realistic JSON payload and a corresponding message key for a Kafka topic named '{req.topic}'. Return ONLY a valid JSON object with the following structure: {{\n  \"key\": \"A suitable string key for the message\",\n  \"value\": {{\n    // The JSON payload representing the message data\n  }}\n}}\nDo not include any markdown formatting, code blocks, or additional text. Just the raw JSON object."

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "input": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_output_tokens": 16384,
        "model": "gpt-5.4-pro"
    }

    try:
        response = requests.post(endpoint, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        
        content = ""
        if "output" in data:
            for item in data["output"]:
                if item.get("type") == "message":
                    for content_item in item.get("content", []):
                        if content_item.get("type") == "output_text":
                            content += content_item.get("text", "")
        elif "choices" in data:
            content = data['choices'][0]['message']['content']
        
        content = content.strip()
        
        # Remove markdown code blocks if the model accidentally included them
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        mock_data = json.loads(content)
        return mock_data
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with Azure OpenAI: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse JSON from OpenAI response.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mock data: {str(e)}")
