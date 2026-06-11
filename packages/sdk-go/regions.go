package aegis

import (
	"context"
	"fmt"
	"net/url"
)

// ── Types ─────────────────────────────────────────────────────────────────────

// Region represents a geographic region with threat context.
type Region struct {
	ISO2        string          `json:"iso2"`
	Name        LocalizedString `json:"name"`
	ThreatLevel int             `json:"threatLevel"` // 1–5
	ActiveAlerts int            `json:"activeAlerts"`
	EventCount  int             `json:"eventCount"`
	UpdatedAt   string          `json:"updatedAt"`
}

// ── Resource ──────────────────────────────────────────────────────────────────

// RegionsResource provides access to geographic region data.
type RegionsResource struct {
	client *AegisClient
}

// Get fetches a single region by its ISO-3166-1 alpha-2 code (e.g. "UA").
func (r *RegionsResource) Get(ctx context.Context, iso2 string) (*Region, error) {
	path := "/api/v1/regions/" + url.PathEscape(iso2)
	var wrapper struct {
		Data Region `json:"data"`
	}
	if err := r.client.do(ctx, "GET", path, nil, &wrapper); err != nil {
		return nil, fmt.Errorf("regions.Get(%q): %w", iso2, err)
	}
	return &wrapper.Data, nil
}

// List fetches all available regions.
func (r *RegionsResource) List(ctx context.Context) ([]*Region, error) {
	var wrapper struct {
		Data []*Region `json:"data"`
	}
	if err := r.client.do(ctx, "GET", "/api/v1/regions", nil, &wrapper); err != nil {
		return nil, fmt.Errorf("regions.List: %w", err)
	}
	return wrapper.Data, nil
}
