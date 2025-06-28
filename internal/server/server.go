package server

import (
	"net/http"

	"github.com/Nykenik24/whimsy/internal/event"
	"github.com/gorilla/websocket"
)

type Server struct {
	host          string
	eventHandlers map[string]event.EventHandler
	conns         map[*websocket.Conn]struct{}
	Config        *ServerConfig
	serveMux      *http.ServeMux
}

func NewServer(host string) *Server {
	return &Server{
		host:          host,
		eventHandlers: make(map[string]event.EventHandler),
		conns:         make(map[*websocket.Conn]struct{}),
		Config:        &ServerConfig{"/ws"},
		serveMux:      http.NewServeMux(),
	}
}

func (s *Server) ListenAndServe() error {
	s.serveMux.HandleFunc(s.Config.WebsocketSub, s.GetSocketHandler())
	return http.ListenAndServe(s.host, s.serveMux)
}
