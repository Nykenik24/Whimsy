package server_test

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"testing"

	"github.com/Nykenik24/whimsy/internal/server"
)

type person struct {
	Name    string "json:\"name\""
	Surname string "json:\"surname\""
}

type personRepo struct {
	People []*person "json:\"people\""
}

func (r *personRepo) Add(p *person) {
	r.People = append(r.People, p)
}

func (r *personRepo) Remove(p *person) {
	for i, v := range r.People {
		if v.Name == p.Name {
			r.People[i] = r.People[len(r.People)-1]
			r.People = r.People[:len(r.People)-1]
		}
	}
}

var (
	PersonRe         = regexp.MustCompile(`^/people/$`)
	PersonReWithName = regexp.MustCompile(`^/people/\w+$`)
)

func newPerson(name, surname string) *person {
	return &person{name, surname}
}

func newPersonRepo() *personRepo {
	return &personRepo{[]*person{}}
}

func RESTTest(t *testing.T) {
	host := "localhost:8000"
	s := server.NewServer(host)
	errHandler := func(w http.ResponseWriter, r *http.Request, errorMessage string) {
		log.Printf("Error at HTTP request to %s: %s", r.URL.Path, errorMessage)
	}

	repo := newPersonRepo()

	s.HTTPGet("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "<h1>Hello!</h1>")
		fmt.Fprintln(w, "<p>Send a request to /people/ or /people/{name}</p>")
		w.WriteHeader(http.StatusOK)
	}, errHandler)

	s.HTTPGetRegex("/people", *PersonRe, func(w http.ResponseWriter, r *http.Request) {
		data, err := json.Marshal(repo.People)
		if err != nil {
			errHandler(w, r, fmt.Sprintf("Error when marhsaling person repo: %s\n", err))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(data)
	}, errHandler)

	s.HTTPGetRegex("/people/", *PersonReWithName, func(w http.ResponseWriter, r *http.Request) {
		matches := PersonReWithName.FindStringSubmatch(r.URL.Path)
		if len(matches) < 2 {
			errHandler(w, r, "expected name when doing a GET request with name to /people/")
			return
		}

		expectedName := matches[1]

		var p *person = nil
		for _, v := range repo.People {
			if v.Name == expectedName {
				p = v
			}
		}
		if p == nil {
			errHandler(w, r, "could not find person "+expectedName)
		}

		data, err := json.Marshal(p)
		if err != nil {
			errHandler(w, r, fmt.Sprintf("Error when marhsaling person repo: %s\n", err))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(data)
	}, errHandler)

	log.Printf("Serving at 'http://%s', websocket at 'ws://%s%s'\n", host, host, s.Config.WebsocketSub)
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
