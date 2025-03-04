from random import randint

import socketio
from terminalVersion import console
from terminalVersion import main as terminal_main
from terminalVersion import render_start as terminal_start


def c(text, color):
    return f"[{color}]{text}[/]"


class SocketClient:
    def __init__(self, server_url="http://localhost:3000", flags={}):
        self.sio = socketio.Client()
        self.server_url = server_url
        self.on_message_callback = None
        self.username = flags.get("username", f"Jhon Doe {randint(0, int(10e10))}")
        self.id = None

        self.sio.on("message", self._receive_message)
        self.sio.on("client-connect", self._connect_callback)

    def _connect_callback(self, data):
        if "generated_id" in data and not self.id:
            self.set_id(data["generated_id"])

    def connect(self):
        try:
            self.sio.connect(self.server_url)
            console.print(c(f"Connected to server at {self.server_url}", "green"))
            self.sio.emit("message", {"msg": f"Welcome, {self.username}!", "user": "SERVER"})
        except Exception as e:
            console.print(c(f"Connection error: {e}", "red"))
            return False
        return True

    def _receive_message(self, data):
        if self.on_message_callback:
            self.on_message_callback(data)

    def send_message(self, message, broadcast=True):
        if self.sio.connected:
            self.sio.emit("message", {"msg": message, "user": self.username, "broadcast": broadcast})
        else:
            console.print(c("Not connected to server.", "red"))

    def set_message_callback(self, callback):
        self.on_message_callback = callback

    def disconnect(self):
        if self.sio.connected:
            console.print(c(f"Sending user-disconnect event for {self.username}", "yellow"))
            self.sio.emit("user-disconnect", {"user": self.username})
            self.sio.sleep(0.1)
            self.sio.disconnect()
        else:
            console.print(c("Client is not connected.", "red"))

    def set_id(self, id):
        self.id = id

    def get_id(self):
        return self.id


if __name__ == "__main__":
    terminal_start()
    terminal_main(SocketClient(flags{
        "username": console.input(c("What is your name?", "yellow") + ": ")
    }))
