from random import randint

import socketio


def check_url(url):
    """Check if an URL is avaliable and active"""
    sio = socketio.Client()

    try:
        # Attempt to connect to the Socket.IO server
        sio.connect(url, transports=['websocket'], wait_timeout=5)
        print(f"URL avaliable: {url}")
        sio.disconnect()
        return True
    except (socketio.exceptions.ConnectionError, Exception) as e:
        print(f"Connection failed: {url} | Error: {e}")
        return False


class SocketClient:
    """Represents a socketio client"""

    def __init__(self, server_url="http://localhost:3000", flags={}):
        self.sio = socketio.Client()
        self.server_url = server_url
        self.on_message_callback = None
        self.username = flags.get("username", f"Jhon Doe {randint(0, int(10e10))}")
        self.id = None

        self.sio.on("message", self._receive_message)
        self.sio.on("client-connect", self._connect_callback)

    def _connect_callback(self, data):
        """The callback for when a new client connects"""
        if "generated_id" in data and not self.id:
            self.set_id(data["generated_id"])

    def connect(self):
        """Connect to a websocket server"""
        # try:
        #     self.sio.connect(self.server_url, headers={"user": self.username})
        #     print(f"Connected to server at {self.server_url}")
        #     print()
        #     # self.sio.emit("message", {
        #     #                             "msg": f"Welcome, {self.username}!",
        #     #                             "user": "SERVER",
        #     #                             "broadcast": True
        #     #                          })
        #     self.sio.sleep(0.5)
        # except Exception as e:
        #     print(f"Connection error: {e}")
        #     return False
        # return True

        if check_url(self.server_url):
            self.sio.connect(self.server_url, headers={"user": self.username})
            print(f"Connected to server at {self.server_url}")
            print()
            self.sio.sleep(0.5)
            return True
        else:
            return False

    def _receive_message(self, data):
        """The callback for when a message is received"""
        if self.on_message_callback:
            self.on_message_callback(data)

    def send_message(self, message, broadcast=True):
        """Send a message to the other clients"""
        if self.sio.connected:
            self.sio.emit("message", {"msg": message, "user": self.username, "broadcast": broadcast})
        else:
            print("Not connected to server.")

    def set_message_callback(self, callback):
        """Set the receive message callback"""
        self.on_message_callback = callback

    def disconnect(self):
        """Disconnect from the current websocket server"""
        if self.sio.connected:
            self.sio.emit("user-disconnect", {"user": self.username})
            self.sio.sleep(0.1)
            self.sio.disconnect()
        else:
            print("Client is not connected.")

    def set_id(self, id):
        """Set a new ID"""
        self.id = id

    def get_id(self):
        """Get the ID"""
        return self.id
