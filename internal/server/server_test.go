package server_test

import (
	"errors"
	"fmt"
	"log"

	"github.com/Nykenik24/whimsy/internal/server"
)

func ServerTest() {
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
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
