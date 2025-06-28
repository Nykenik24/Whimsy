package client

import (
	"fmt"
	"log"

	"github.com/Nykenik24/whimsy/internal/event"
	"github.com/gorilla/websocket"
)

type Client struct {
	hosts         ClientHosts
	eventHandlers map[string]event.EventHandler
	Conn          *websocket.Conn
}

type ClientHosts struct {
	MainHost   string
	SocketHost string
}

func NewClient(host, wsHost string) *Client {
	conn, _, err := websocket.DefaultDialer.Dial(wsHost, nil)
	if err != nil {
		log.Fatal("Error connecting to Websocket Server:", err)
	}
	c := &Client{ClientHosts{host, wsHost}, make(map[string]event.EventHandler), conn}
	c.Send("connect", map[string]any{})
	return c
}

func (c *Client) On(eventType string, handler event.EventHandler) error {
	if _, alreadyExists := c.eventHandlers[eventType]; alreadyExists {
		return fmt.Errorf("Handler for '%s' already exists in client", eventType)
	}
	c.eventHandlers[eventType] = handler
	return nil
}

func (c *Client) OverrideHandler(eventType string, newHandler event.EventHandler) error {
	if _, exists := c.eventHandlers[eventType]; !exists {
		return fmt.Errorf("Trying to override handler for '%s', which doesn't exist exist in client", eventType)
	}
	c.eventHandlers[eventType] = newHandler
	return nil
}

func (c *Client) Send(eventType string, payload map[string]any) error {
	event := event.NewEvent(eventType, payload)
	jsonString, marhsalErr := event.EventToJSON()
	if marhsalErr != nil {
		return fmt.Errorf("Error marshaling message: %s", marhsalErr)
	}
	writeErr := c.Conn.WriteMessage(websocket.TextMessage, []byte(jsonString))
	if writeErr != nil {
		return fmt.Errorf("Error sending message: %s", writeErr)
	}
	return nil
}

func (c *Client) SendEvent(event event.Event) error {
	payload, marhsalErr := event.EventToJSON()
	if marhsalErr != nil {
		return fmt.Errorf("Error marshaling message: %s", marhsalErr)
	}
	writeErr := c.Conn.WriteMessage(websocket.TextMessage, []byte(payload))
	if writeErr != nil {
		return fmt.Errorf("Error sending message: %s", writeErr)
	}
	return nil
}

func (c *Client) Listen() {
	defer c.Conn.Close()
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("Error during message reading:", err)
			break
		}
		event, err := event.EventFromJSON(message)
		if err != nil {
			log.Println("Error during message to event conversion:", err)
		}
		if _, hasHandlerForEvent := c.eventHandlers[event.Type]; hasHandlerForEvent {
			err := c.eventHandlers[event.Type](event.Payload)
			if err != nil {
				log.Println("Error during event handling:", err)
				break
			}
		}
	}
}
