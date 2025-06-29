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
	for i := 0; i < len(r.People); i++ {
		if r.People[i].Name == p.Name {
			r.People = append(r.People[:i], r.People[i+1:]...)
			i--
		}
	}
}

var (
	PersonRe         = regexp.MustCompile(`^/people/?$`)
	PersonReWithName = regexp.MustCompile(`^/people/(\w+)$`)
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
	repo.Add(newPerson("John", "Doe"))
	repo.Add(newPerson("Ben", "Dover"))

	s.HTTPGet("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "<h1>Hello!</h1>")
		fmt.Fprintln(w, "<p>Send a request to /people/ or /people/{name}</p>")
	}, errHandler)

	s.HTTPGetRegex("/people", *PersonRe, func(w http.ResponseWriter, r *http.Request) {
		data, err := json.Marshal(repo.People)
		if err != nil {
			errHandler(w, r, fmt.Sprintf("Error when marhsaling person repo: %s\n", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(data)
	}, errHandler)

	s.HTTPGetRegex("/people/", *PersonReWithName, func(w http.ResponseWriter, r *http.Request) {
		matches := PersonReWithName.FindStringSubmatch(r.URL.Path)
		if len(matches) < 2 {
			errHandler(w, r, "expected name when doing a GET request with name to /people/")
			w.WriteHeader(http.StatusBadRequest)
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
			w.WriteHeader(http.StatusNotFound)
			return
		}

		data, err := json.Marshal(p)
		if err != nil {
			errHandler(w, r, fmt.Sprintf("Error when marhsaling person repo: %s\n", err))
			w.WriteHeader(http.StatusInternalServerError)
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
