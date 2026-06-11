package aegis

import (
	"context"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// ── Types ─────────────────────────────────────────────────────────────────────

// EventClass enumerates supported event classifications.
type EventClass string

const (
	EventClassMilitaryAction  EventClass = "military_action"
	EventClassInfrastructure  EventClass = "infrastructure"
	EventClassCivilianAlert   EventClass = "civilian_alert"
	EventClassHumanitarian    EventClass = "humanitarian"
	EventClassCyber           EventClass = "cyber"
	EventClassMaritime        EventClass = "maritime"
	EventClassAviation        EventClass = "aviation"
	EventClassEnvironmental   EventClass = "environmental"
	EventClassPolitical       EventClass = "political"
	EventClassEconomic        EventClass = "economic"
)

// VerificationState represents the cross-verification status of an event.
type VerificationState string

const (
	VerificationUnverified   VerificationState = "unverified"
	VerificationCorroborated VerificationState = "corroborated"
	VerificationVerified     VerificationState = "verified"
	VerificationDisputed     VerificationState = "disputed"
	VerificationRetracted    VerificationState = "retracted"
)

// GeoPoint is a geographic coordinate with optional precision radius.
type GeoPoint struct {
	Lat        float64  `json:"lat"`
	Lon        float64  `json:"lon"`
	PrecisionM *float64 `json:"precisionM,omitempty"`
}

// EventSource is a primary or corroborating source for an event.
type EventSource struct {
	URL         string `json:"url"`
	ArchiveURL  string `json:"archiveUrl,omitempty"`
	FetchedAt   string `json:"fetchedAt"`
	Language    string `json:"language"`
	ContentHash string `json:"contentHash"`
}

// EventMedia is image or video evidence attached to an event.
type EventMedia struct {
	ID                string            `json:"id"`
	Type              string            `json:"type"` // "image" | "video"
	URL               string            `json:"url"`
	ThumbnailURL      string            `json:"thumbnailUrl,omitempty"`
	VerificationState VerificationState `json:"verificationState"`
}

// LocalizedString is a map of locale → text with a required "en" key.
type LocalizedString map[string]string

// Event is a single verified geospatial security event.
type Event struct {
	EventID           string            `json:"eventId"`
	OccurredAt        time.Time         `json:"occurredAt"`
	ReportedAt        time.Time         `json:"reportedAt"`
	IngestedAt        time.Time         `json:"ingestedAt"`
	Location          GeoPoint          `json:"location"`
	Class             EventClass        `json:"class"`
	Subclass          string            `json:"subclass,omitempty"`
	Severity          int               `json:"severity"`
	DangerScore       float64           `json:"dangerScore"`
	Confidence        float64           `json:"confidence"`
	VerificationState VerificationState `json:"verificationState"`
	Sources           []EventSource     `json:"sources"`
	Media             []EventMedia      `json:"media"`
	Summary           LocalizedString   `json:"summary"`
	OriginalText      string            `json:"originalText,omitempty"`
}

// PageInfo carries pagination metadata.
type PageInfo struct {
	Count      int     `json:"count"`
	Total      int     `json:"total"`
	HasMore    bool    `json:"hasMore"`
	NextCursor *string `json:"nextCursor"`
}

// EventsResponse is the paginated events list response.
type EventsResponse struct {
	Data []Event  `json:"data"`
	Meta PageInfo `json:"meta"`
}

// EventFilter specifies filters for event queries.
type EventFilter struct {
	// ISO-3166-1 alpha-2 country code, e.g. "UA"
	Country string
	// One or more event classes
	Classes []EventClass
	// Events after this time
	Since *time.Time
	// Events before this time
	Until *time.Time
	// Convenience: events in the last N hours (overrides Since)
	Hours int
	// Minimum severity (1–3)
	Severity int
	// Max results per page
	Limit int
	// Pagination cursor from a previous response
	Cursor string
}

// ── Resource ──────────────────────────────────────────────────────────────────

// EventsResource provides methods for accessing events.
type EventsResource struct {
	client *AegisClient
}

// List fetches a page of events matching the given filter.
func (r *EventsResource) List(ctx context.Context, filter EventFilter) (*EventsResponse, error) {
	path := buildEventsPath(filter)
	var resp EventsResponse
	if err := r.client.do(ctx, "GET", path, nil, &resp); err != nil {
		return nil, fmt.Errorf("events.List: %w", err)
	}
	return &resp, nil
}

// Get fetches a single event by its ID.
func (r *EventsResource) Get(ctx context.Context, id string) (*Event, error) {
	path := "/api/events/" + url.PathEscape(id)
	var wrapper struct {
		Data Event `json:"data"`
	}
	if err := r.client.do(ctx, "GET", path, nil, &wrapper); err != nil {
		return nil, fmt.Errorf("events.Get: %w", err)
	}
	return &wrapper.Data, nil
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func buildEventsPath(f EventFilter) string {
	params := url.Values{}

	if f.Country != "" {
		params.Set("country", f.Country)
	}
	if len(f.Classes) > 0 {
		strs := make([]string, len(f.Classes))
		for i, c := range f.Classes {
			strs[i] = string(c)
		}
		params.Set("class", strings.Join(strs, ","))
	}
	if f.Hours > 0 {
		params.Set("hours", strconv.Itoa(f.Hours))
	} else if f.Since != nil {
		params.Set("since", f.Since.UTC().Format(time.RFC3339))
	}
	if f.Until != nil {
		params.Set("until", f.Until.UTC().Format(time.RFC3339))
	}
	if f.Severity > 0 {
		params.Set("severity", strconv.Itoa(f.Severity))
	}
	if f.Limit > 0 {
		params.Set("limit", strconv.Itoa(f.Limit))
	}
	if f.Cursor != "" {
		params.Set("cursor", f.Cursor)
	}

	if len(params) == 0 {
		return "/api/events"
	}
	return "/api/events?" + params.Encode()
}
