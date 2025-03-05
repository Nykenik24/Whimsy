from random import choice, randint

import socketio
from rich import color as richcolor
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
        if "color" in flags:
            if flags["color"] in list(richcolor.ANSI_COLOR_NAMES.keys()):
                self.color = flags["color"]
            else:
                self.color = choice(list(richcolor.ANSI_COLOR_NAMES.keys()))

        self.sio.on("message", self._receive_message)
        self.sio.on("client-connect", self._connect_callback)

    def _connect_callback(self, data):
        if "generated_id" in data and not self.id:
            self.set_id(data["generated_id"])

    def connect(self):
        try:
            self.sio.connect(self.server_url, headers={"user": self.username})
            console.print(c(f"Connected to server at {self.server_url}", "green"))
            console.print()
            # self.sio.emit("message", {
            #                             "msg": f"Welcome, {self.username}!",
            #                             "user": "SERVER",
            #                             "broadcast": True
            #                          })
            self.sio.sleep(0.5)
        except Exception as e:
            console.print(c(f"Connection error: {e}", "red"))
            return False
        return True

    def _receive_message(self, data):
        if self.on_message_callback:
            self.on_message_callback(data)

    def send_message(self, message, broadcast=True):
        if self.sio.connected:
            self.sio.emit("message", {"msg": message, "user": self.username, "broadcast": broadcast, "color": self.color})
        else:
            console.print(c("Not connected to server.", "red"))

    def set_message_callback(self, callback):
        self.on_message_callback = callback

    def disconnect(self):
        if self.sio.connected:
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
    username = console.input(c("What is your name?", "yellow") + ": ")
    console.print(c("TIP: Leave the color empty for a random one", "cyan"))
    user_color = console.input(c("What color do you want?", "yellow") + ": ")

    terminal_main(SocketClient(flags={
        "username": username,
        "color": user_color
    }))
