package main

import (
	"log"
	"net/http"

	"github.com/Nykenik24/whimsy/internal/server"
)

func main() {
	host := "localhost:8000"
	s := server.NewServer(host)
	s.HTTPGet("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World!"))
	}, server.DefaultRequestErrorHandler())

	log.Printf("Serving at 'http://%s'\n", host)
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
