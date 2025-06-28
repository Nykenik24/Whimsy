package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/Nykenik24/whimsy/client"
	"github.com/Nykenik24/whimsy/server"
	"github.com/gorilla/websocket"
)

func main() {
	host := "localhost:8000"
	s := server.NewServer(host)
	s.Config.WebsocketSub = "/"

	s.On("log", func(payload map[string]any) error {
		msg, hasMsg := payload["msg"]
		if !hasMsg {
			return errors.New("Server: no message in 'log' event payload")
		}
		fmt.Println("Message from client:", msg)
		return s.SendToAll("log", map[string]any{"msg": msg})
	})

	s.On("connect", func(payload map[string]any) error {
		fmt.Println("New client connected")
		return nil
	})

	log.Printf("Serving at 'http://%s', websocket at 'ws://%s%s'\n", host, host, s.Config.WebsocketSub)
	go func() {
		if err := s.ListenAndServe(); err != nil {
			log.Fatalf("Server error: %v", err)
		}
	}()

	time.Sleep(100 * time.Millisecond)

	c := client.NewClient(fmt.Sprintf("http://%s", host), fmt.Sprintf("ws://%s%s", host, s.Config.WebsocketSub))

	c.On("log", func(payload map[string]any) error {
		msg, hasMsg := payload["msg"]
		if !hasMsg {
			return errors.New("Client: no message in 'log' event payload")
		}
		fmt.Println("Message from server:", msg)
		return nil
	})

	log.Println("Client listening")
	go c.Listen()

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	for {
		select {
		case <-time.After(1 * time.Second):
			err := c.Send("log", map[string]any{
				"msg": "Hello, World!",
			})
			if err != nil {
				log.Println("Error during sending message:", err)
				return
			}

		case <-interrupt:
			log.Println("Received interrupt signal. Closing client connection...")

			err := c.Conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("Error during closing websocket:", err)
			}
			c.Conn.Close()
			return
		}
	}
}
