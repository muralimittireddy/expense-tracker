# backend/app/api/v1/splits_ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json

class ConnectionManager:
    """Manages active WebSocket connections for group-specific channels."""
    def __init__(self):
        # Store active connections: {group_id: [websockets]}
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group_id: int):
        """Accepts a new WebSocket connection and adds it to the group's list."""
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
        self.active_connections[group_id].append(websocket)
        print(f"New connection in group {group_id}. Total: {len(self.active_connections[group_id])}")


    def disconnect(self, websocket: WebSocket, group_id: int):
        """Removes a WebSocket connection from the group's list."""
        if group_id in self.active_connections:
            self.active_connections[group_id].remove(websocket)
            # If the group has no more connections, remove the group key
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]
            print(f"Connection closed in group {group_id}.")


    async def broadcast(self, group_id: int, message: dict):
        """Sends a JSON message to all clients connected to a specific group."""
        if group_id in self.active_connections:
            connections = self.active_connections[group_id]
            # The message is sent as a JSON string
            for connection in connections:
                await connection.send_json(message)

# Singleton instance of the manager
manager = ConnectionManager()

# WebSocket router
router = APIRouter()

@router.websocket("/ws/groups/{group_id}")
async def websocket_endpoint(websocket: WebSocket, group_id: int):
    """WebSocket endpoint that handles client connections for a specific group."""
    await manager.connect(websocket, group_id)
    try:
        while True:
            # The endpoint listens for messages but doesn't need to act on them.
            # This keeps the connection alive. The main purpose is broadcasting from HTTP endpoints.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, group_id)
