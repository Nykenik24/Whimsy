package event

import "encoding/json"

type (
	EventHandler func(payload map[string]any) error
	Event        struct {
		Type    string         "json:\"type\""
		Payload map[string]any "json:\"payload\""
	}
)

func NewEvent(type_ string, payload map[string]any) *Event {
	return &Event{type_, payload}
}

func (e *Event) EventToJSON() ([]byte, error) {
	return json.Marshal(e)
}

func EventFromJSON(jsonString []byte) (*Event, error) {
	event := &Event{}
	err := json.Unmarshal(jsonString, event)
	if err != nil {
		return nil, err
	}
	return event, nil
}
