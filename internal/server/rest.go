package server

import (
	"fmt"
	"log"
	"net/http"
)

type ErrorHandler func(w http.ResponseWriter, r *http.Request, errorMessage string)

func (s *Server) HTTPGet(route string, handler http.HandlerFunc, errHandler ErrorHandler) {
	s.serveMux.HandleFunc(route, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handler(w, r)
		} else {
			errHandler(w, r, fmt.Sprintf("expected GET, got %s", r.Method))
		}
	})
}

func (s *Server) HTTPPost(route string, handler http.HandlerFunc, errHandler ErrorHandler) {
	s.serveMux.HandleFunc(route, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handler(w, r)
		} else {
			errHandler(w, r, fmt.Sprintf("expected POST, got %s", r.Method))
		}
	})
}

func (s *Server) HTTPDelete(route string, handler http.HandlerFunc, errHandler ErrorHandler) {
	s.serveMux.HandleFunc(route, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			handler(w, r)
		} else {
			errHandler(w, r, fmt.Sprintf("expected DELETE, got %s", r.Method))
		}
	})
}

func (s *Server) HTTPPut(route string, handler http.HandlerFunc, errHandler ErrorHandler) {
	s.serveMux.HandleFunc(route, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPut {
			handler(w, r)
		} else {
			errHandler(w, r, fmt.Sprintf("expected PUT, got %s", r.Method))
		}
	})
}

func DefaultRequestErrorHandler() ErrorHandler {
	return func(w http.ResponseWriter, r *http.Request, errorMessage string) {
		log.Fatalf("Error at HTTP request: %s", errorMessage)
	}
}
