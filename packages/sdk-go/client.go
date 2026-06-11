// Package aegis provides a Go client for the Aegis Lens API.
//
// Usage:
//
//	client := aegis.NewClient("ak_your_api_key")
//	events, err := client.Events.List(ctx, aegis.EventFilter{Country: "UA", Hours: 24})
package aegis

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	defaultBaseURL   = "https://aegislens.io"
	defaultTimeout   = 30 * time.Second
	sdkVersion       = "0.1.0"
	userAgentDefault = "aegis-sdk-go/" + sdkVersion
)

// AegisClient is the top-level API client.
// Use NewClient or NewClientWithBase to construct one.
type AegisClient struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
	userAgent  string

	// Resource accessors
	Events  *EventsResource
	Regions *RegionsResource
}

// NewClient creates an AegisClient targeting the default production endpoint.
func NewClient(apiKey string) *AegisClient {
	return NewClientWithBase(apiKey, defaultBaseURL)
}

// NewClientWithBase creates an AegisClient with a custom base URL.
// Useful for staging environments or self-hosted instances.
func NewClientWithBase(apiKey, baseURL string) *AegisClient {
	c := &AegisClient{
		BaseURL: baseURL,
		APIKey:  apiKey,
		HTTPClient: &http.Client{
			Timeout: defaultTimeout,
		},
		userAgent: userAgentDefault,
	}
	c.Events = &EventsResource{client: c}
	c.Regions = &RegionsResource{client: c}
	return c
}

// do performs an HTTP request and decodes the JSON response into dest.
func (c *AegisClient) do(ctx context.Context, method, path string, body, dest any) error {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("aegis: marshal request: %w", err)
		}
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+path, reqBody)
	if err != nil {
		return fmt.Errorf("aegis: build request: %w", err)
	}

	req.Header.Set("User-Agent", c.userAgent)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if c.APIKey != "" {
		req.Header.Set("X-Api-Key", c.APIKey)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("aegis: http: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		raw, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("aegis: API error %d: %s", resp.StatusCode, string(raw))
	}

	if dest != nil {
		if err := json.NewDecoder(resp.Body).Decode(dest); err != nil {
			return fmt.Errorf("aegis: decode response: %w", err)
		}
	}

	return nil
}
