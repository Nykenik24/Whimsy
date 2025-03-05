from random import choice, randint

import socketio
from rich.console import Console
from rich.text import Text


def c(text, color):
    return f"[{color}]{text}[/]"


console = Console()


def usage():
    console.print(c("== Commands ==", "blue"))
    console.print(c("/quit: Disconnects from server", "blue"))
    console.print(c("/getid: Returns client ID", "blue"))
    console.print(c("/getinfo: Returns client info", "blue"))


def render_start():
    r, g, b = randint(0, 255), randint(0, 255), randint(0, 255)
    whimsy_art = Text("""
    W   W  H   H  III  M   M  SSSS  Y   Y
    W   W  H   H   I   MM MM  S      Y Y
    W W W  HHHHH   I   M M M  SSSS    Y
    WW WW  H   H   I   M   M     S    Y
    W   W  H   H  III  M   M  SSSS    Y
    """, style=f"rgb({r},{g},{b})")
    console.print(whimsy_art)

    console.print(c("You are now using the terminal-based client of Whimsy.", "green"))
    usage()


def main(client):
    console.print(c("You are getting connected to the server...", "red"))

    def callback(data):
        if data["user"] != client.username:
            msg = data["msg"]
            before = f"{data['date']} {data['time']} {data['user']}: "
            before_color = "red" if data["user"] == "SYSTEM" else data["color"]
            if msg:
                print("\r\033[2K", end="")
                console.print(c(before, before_color) + msg)
                console.print(c(f"{client.username}> ", "cyan"), end="")

    if client.connect():
        client.set_message_callback(callback)

    while True:
        try:
            message = console.input(c(f"{client.username}> ", "cyan"))
            if message.lower() == "/quit":
                client.disconnect()
                break
            elif message.lower() == "/getid":
                console.print(c(client.get_id(), "blue"))
            elif message.lower() == "/getinfo":
                info = {
                    "username": client.username,
                    "id": client.get_id(),
                }
                for key in info.keys():
                    val = info[key]
                    console.print(f"[blue]\"{key}\"[/]: [green]\"{val}\"[/]")
            elif message.lower() == "/help":
                usage()
            else:
                client.send_message(message)
        except socketio.exceptions.DisconnectedError:
            client.sio.emit("user-disconnect", {"user": client.username})
            break
