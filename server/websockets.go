package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Nykenik24/whimsy/event"
	"github.com/gorilla/websocket"
)

func (s *Server) AddEventHandler(eventType string, handler event.EventHandler) error {
	if _, alreadyExists := s.eventHandlers[eventType]; alreadyExists {
		return fmt.Errorf("Handler for '%s' already exists", eventType)
	}
	s.eventHandlers[eventType] = handler
	return nil
}

func (s *Server) OverrideEventHandler(eventType string, newHandler event.EventHandler) error {
	if _, exists := s.eventHandlers[eventType]; !exists {
		return fmt.Errorf("Trying to override handler for '%s', which doesn't exist exist", eventType)
	}
	s.eventHandlers[eventType] = newHandler
	return nil
}

func (s *Server) SendToAll(eventType string, payload map[string]any) error {
	event := event.NewEvent(eventType, payload)
	data, err := event.EventToJSON()
	if err != nil {
		return fmt.Errorf("Error marshaling message: %w", err)
	}
	for conn := range s.conns {
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("Error sending message to client:", err)
		}
	}
	return nil
}

func (s *Server) SendTo(conn *websocket.Conn, eventType string, payload map[string]any) error {
	event := event.NewEvent(eventType, payload)
	data, err := event.EventToJSON()
	if err != nil {
		return fmt.Errorf("Error marshaling message: %w", err)
	}
	return conn.WriteMessage(websocket.TextMessage, data)
}

var upgrader = websocket.Upgrader{}

func (s *Server) GetSocketHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("Error during connection upgradation:", err)
			return
		}
		defer conn.Close()

		s.conns[conn] = struct{}{}

		defer func() {
			delete(s.conns, conn)
		}()

		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error during message reading:", err)
				break
			}
			ev, err := event.EventFromJSON(message)
			if err != nil {
				log.Println("Error during message to event conversion:", err)
				continue
			}
			if handler, ok := s.eventHandlers[ev.Type]; ok {
				err := handler(ev.Payload)
				if err != nil {
					log.Println("Error during event handling:", err)
					break
				}
			}
		}
	}
}
