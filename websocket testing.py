# Simple websockets testing

import asyncio
import websockets
import json
import time

async def send_data(websocket, path):
    while True:
        data = {"signal": "GREEN", "timestamp": time.time()}
        await websocket.send(json.dumps(data))
        await asyncio.sleep(2)

start_server = websockets.serve(send_data, "0.0.0.0", 8765)  # 0.0.0.0 → listen to all network interfaces

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
