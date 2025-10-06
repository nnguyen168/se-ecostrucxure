"""Genie Conversational API integration for AI assistant."""

import os
import asyncio
import logging
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from databricks.sdk import WorkspaceClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class MessageStatus(str, Enum):
    """Message processing status."""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SUBMITTED = "SUBMITTED"


class ChatMessage(BaseModel):
    """Chat message model."""
    content: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    conversation_id: str
    message_id: str
    content: str
    status: MessageStatus
    sql_query: Optional[str] = None
    query_results: Optional[Dict[str, Any]] = None  # Changed to Dict to hold structured results
    timestamp: datetime


class ConversationStart(BaseModel):
    """Start conversation response."""
    conversation_id: str
    created_at: datetime


def get_auth_config():
    """Get authentication configuration for Databricks."""
    # In Databricks Apps, OAuth is used automatically
    # We need to use the explicit token for Genie API calls

    # First, get the host from SDK
    try:
        from databricks.sdk.core import Config
        # Create config with only host to avoid auth conflicts
        config = Config()
        host = config.host.rstrip('/') if config.host else None
    except:
        host = None

    # If no host from SDK, try environment
    if not host:
        host = os.getenv('DATABRICKS_HOST', '').rstrip('/')

    # If still no host, try from .env.local
    if not host:
        from dotenv import load_dotenv
        load_dotenv('.env.local')
        host = os.getenv('DATABRICKS_HOST', '').rstrip('/')

    # For token, use the explicit token from environment
    # This avoids OAuth conflicts
    token = os.getenv('DATABRICKS_TOKEN')

    # If no token in env, try .env.local
    if not token:
        from dotenv import load_dotenv
        load_dotenv('.env.local')
        token = os.getenv('DATABRICKS_TOKEN')

    logger.info(f"Auth config - Host: {host[:30] if host else 'None'}..., Token: {'Present' if token else 'Missing'}")
    return host, token


@router.post("/send-message", response_model=ChatResponse)
async def send_message(message: ChatMessage):
    """Send a message to Genie and get response."""

    # Get Genie Space ID from environment
    GENIE_SPACE_ID = os.getenv('DATABRICKS_GENIE_SPACE_ID', '')

    if not GENIE_SPACE_ID:
        logger.error("Missing Genie Space ID configuration")
        raise HTTPException(
            status_code=500,
            detail="Genie Space ID not configured. Please set DATABRICKS_GENIE_SPACE_ID."
        )

    # Get authentication configuration
    host, token = get_auth_config()

    if not host or not token:
        logger.error(f"Missing auth - Host: {bool(host)}, Token: {bool(token)}")
        raise HTTPException(
            status_code=500,
            detail="Authentication not configured properly."
        )

    # Build headers
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    conversation_id = message.conversation_id

    async with httpx.AsyncClient(timeout=60.0, verify=False) as client:
        try:
            # If no conversation ID, start a new conversation
            if not conversation_id:
                logger.info("Starting new conversation")

                # Start conversation endpoint
                start_url = f"{host}/api/2.0/genie/spaces/{GENIE_SPACE_ID}/start-conversation"
                payload = {"content": message.content}

                logger.info(f"Calling: {start_url}")

                # Make the API call
                response = await client.post(start_url, headers=headers, json=payload)

                if response.status_code != 200:
                    logger.error(f"Failed to start conversation: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Failed to start conversation: {response.text}"
                    )

                data = response.json()
                conversation_id = data.get("conversation_id")
                message_id = data.get("message_id")

                logger.info(f"Started conversation: {conversation_id}, message: {message_id}")

            else:
                # Continue existing conversation
                logger.info(f"Continuing conversation: {conversation_id}")

                # Send message endpoint
                send_url = f"{host}/api/2.0/genie/spaces/{GENIE_SPACE_ID}/conversations/{conversation_id}/messages"
                payload = {"content": message.content}

                logger.info(f"Sending message to: {send_url}")

                # Make the API call
                response = await client.post(send_url, headers=headers, json=payload)

                if response.status_code != 200:
                    logger.error(f"Failed to send message: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Failed to send message: {response.text}"
                    )

                data = response.json()
                message_id = data.get("message_id")
                logger.info(f"Sent message: {message_id}")

            # Poll for message completion
            for attempt in range(20):
                await asyncio.sleep(3)

                # Get message status
                status_url = f"{host}/api/2.0/genie/spaces/{GENIE_SPACE_ID}/conversations/{conversation_id}/messages/{message_id}"

                logger.info(f"Checking status: attempt {attempt + 1}")
                logger.info(f"Status URL: {status_url}")

                status_response = await client.get(status_url, headers=headers)

                if status_response.status_code != 200:
                    logger.warning(f"Status check failed: {status_response.status_code}")
                    logger.warning(f"Status response: {status_response.text}")
                    continue

                status_data = status_response.json()
                message_status = status_data.get("status", "")

                logger.info(f"Message status: {message_status}")
                logger.info(f"Full status response keys: {list(status_data.keys())}")

                if message_status == "COMPLETED":
                    # Extract response content
                    content = status_data.get("content", "")
                    attachments = status_data.get("attachments", [])

                    logger.info(f"Response content: {content}")
                    logger.info(f"Number of attachments: {len(attachments)}")

                    sql_query = None
                    query_description = None
                    query_results = None

                    # Process attachments
                    text_content = None
                    for attachment in attachments:
                        logger.info(f"Processing attachment: {attachment.get('type', 'unknown')}")
                        logger.info(f"Attachment keys: {list(attachment.keys())}")

                        # Handle text attachments (for responses without queries)
                        if "text" in attachment:
                            text_info = attachment.get("text", {})
                            text_content = text_info.get("content", "")
                            logger.info(f"Found text attachment with content length: {len(text_content)}")

                        # Handle query attachments
                        if "query" in attachment:
                            query_info = attachment.get("query", {})
                            sql_query = query_info.get("query", "")
                            # Extract the description - this is what Genie wants to tell the user!
                            query_description = query_info.get("description", "")
                            attachment_id = attachment.get("attachment_id")
                            logger.info(f"Query description: {query_description}")
                            logger.info(f"SQL query length: {len(sql_query)}")
                            logger.info(f"Attachment ID: {attachment_id}")

                            # Fetch query results if available
                            if attachment_id:
                                # Build the query result URL
                                result_url = f"{status_url}/query-result/{attachment_id}"
                                logger.info(f"Fetching query results from: {result_url}")
                                logger.info(f"Attachment ID: {attachment_id}")

                                result_response = await client.get(result_url, headers=headers)
                                logger.info(f"Query result fetch status: {result_response.status_code}")

                                if result_response.status_code == 200:
                                    result_data = result_response.json()

                                    # Log the full response for debugging
                                    logger.info(f"Full query result response: {json.dumps(result_data)[:1000]}")

                                    # Extract from the correct path: statement_response.result.data_array
                                    statement_response = result_data.get("statement_response", {})

                                    # Get the data array from statement_response.result
                                    result_section = statement_response.get("result", {})
                                    data_array = result_section.get("data_array", [])

                                    # Get column schema from statement_response.manifest
                                    manifest = statement_response.get("manifest", {})
                                    schema = manifest.get("schema", {})
                                    columns = schema.get("columns", [])

                                    logger.info(f"Columns: {[col.get('name') for col in columns]}")
                                    logger.info(f"Raw data array from API: {data_array}")
                                    logger.info(f"Data array type: {type(data_array)}, length: {len(data_array) if data_array else 0}")

                                    # Format results with column names
                                    if columns and data_array:
                                        # Create structured results with column names
                                        query_results = {
                                            "columns": [col.get("name") for col in columns],
                                            "column_types": [col.get("type_text") for col in columns],
                                            "data": data_array,
                                            "row_count": len(data_array)
                                        }
                                        logger.info(f"Created query_results: {json.dumps(query_results)[:200]}")
                                    else:
                                        query_results = None
                                        logger.warning(f"No results created - columns: {bool(columns)}, data: {bool(data_array)}")
                                else:
                                    logger.error(f"Failed to fetch query results: {result_response.status_code} - {result_response.text}")
                                    query_results = None

                    # Generate response content
                    # Priority: 1) Query description, 2) Text attachment content, 3) Message content, 4) Default
                    if query_description:
                        response_content = query_description
                        logger.info(f"Using query_description as response: {query_description}")
                    elif text_content:
                        response_content = text_content
                        logger.info(f"Using text attachment content as response: {text_content[:200]}...")
                    elif content and content not in ["", "I've processed your request."]:
                        response_content = content
                        logger.info(f"Using content as response: {content}")
                    else:
                        response_content = "Here are the results from your query."
                        logger.info("Using default response message")

                    logger.info(f"Final response_content: {response_content}")
                    logger.info(f"Has SQL: {bool(sql_query)}, Has results: {bool(query_results)}")

                    return ChatResponse(
                        conversation_id=conversation_id,
                        message_id=message_id,
                        content=response_content,
                        status=MessageStatus.COMPLETED,
                        sql_query=sql_query,
                        query_results=query_results,
                        timestamp=datetime.now()
                    )

                elif message_status == "FAILED":
                    error_msg = status_data.get("error", "Request failed")
                    logger.error(f"Message failed: {error_msg}")
                    return ChatResponse(
                        conversation_id=conversation_id,
                        message_id=message_id,
                        content=f"I encountered an error: {error_msg}",
                        status=MessageStatus.FAILED,
                        timestamp=datetime.now()
                    )

            # Timeout after polling
            return ChatResponse(
                conversation_id=conversation_id,
                message_id=message_id,
                content="The request is taking longer than expected. Please try again.",
                status=MessageStatus.PROCESSING,
                timestamp=datetime.now()
            )

        except Exception as e:
            logger.error(f"Error in Genie API call: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to communicate with Genie: {str(e)}"
            )


@router.get("/health")
async def health_check():
    """Check if Genie API is configured and accessible."""
    try:
        host, token = get_auth_config()
        configured = bool(os.getenv('DATABRICKS_GENIE_SPACE_ID')) and bool(token) and bool(host)

        return {
            "status": "healthy",
            "configured": configured,
            "space_id": os.getenv('DATABRICKS_GENIE_SPACE_ID', '')[:8] + "..." if configured else None,
            "host": host[:30] + "..." if host else None
        }
    except Exception as e:
        return {
            "status": "error",
            "configured": False,
            "error": str(e)
        }