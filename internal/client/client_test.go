package client_test

import (
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"testing"
	"time"

	"github.com/Nykenik24/whimsy/internal/client"
	"github.com/gorilla/websocket"
)

var interrupt chan os.Signal

func ClientTest(t *testing.T) {
	host := "localhost:8000"
	c := client.NewClient(fmt.Sprintf("http://%s", host), fmt.Sprintf("ws://%s%s", host, "/ws"))

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
