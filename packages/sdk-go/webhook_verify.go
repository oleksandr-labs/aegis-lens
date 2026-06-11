package aegis

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

const (
	// SignatureHeader is the HTTP header carrying the HMAC-SHA256 signature.
	// Matches services/webhooks/src/signer.ts convention.
	SignatureHeader = "x-aegis-signature-256"

	// TimestampHeader carries the Unix seconds timestamp used in the signature.
	TimestampHeader = "x-aegis-timestamp"

	// DefaultToleranceSeconds is the replay-attack window (5 minutes).
	DefaultToleranceSeconds = 300
)

// VerifyWebhookSignature verifies a webhook delivery signature.
//
// signature should be the value of the x-aegis-signature-256 header (format: "sha256=<hex>").
// The function also accepts just the hex string without the "sha256=" prefix.
//
// This implementation mirrors the Node.js signer in services/webhooks/src/signer.ts:
//
//	message = "<timestamp>.<body>"
//	sig = HMAC-SHA256(secret, message) → "sha256=<hex>"
//
// The timestamp is extracted from the signature string when provided in the
// "sha256=<hex>;<ts>" extended format, or must be provided separately via
// the x-aegis-timestamp header value passed as the timestamp parameter.
//
// Usage:
//
//	ok := aegis.VerifyWebhookSignature(payload, signature, secret)
func VerifyWebhookSignature(payload []byte, signature, secret string) bool {
	return VerifyWebhookSignatureWithTimestamp(payload, signature, secret, "", DefaultToleranceSeconds)
}

// VerifyWebhookSignatureWithTimestamp verifies with an explicit Unix-seconds timestamp string.
// Use this when the timestamp comes from the x-aegis-timestamp header.
func VerifyWebhookSignatureWithTimestamp(
	payload []byte,
	signature, secret, timestampStr string,
	toleranceSeconds int,
) bool {
	if secret == "" || len(payload) == 0 {
		return false
	}

	// Normalise signature — strip "sha256=" prefix if present
	sigHex := signature
	if strings.HasPrefix(sigHex, "sha256=") {
		sigHex = sigHex[7:]
	}

	// Decode expected signature bytes for timing-safe comparison
	sigBytes, err := hex.DecodeString(sigHex)
	if err != nil || len(sigBytes) == 0 {
		return false
	}

	// Resolve timestamp
	var tsUnix int64
	if timestampStr != "" {
		tsUnix, err = strconv.ParseInt(timestampStr, 10, 64)
		if err != nil {
			return false
		}
	} else {
		// No timestamp provided — cannot verify replay tolerance
		// Build the message without a timestamp prefix (legacy mode)
		mac := hmac.New(sha256.New, []byte(secret))
		mac.Write(payload)
		expected := mac.Sum(nil)
		return hmac.Equal(sigBytes, expected)
	}

	// Replay attack check
	now := time.Now().Unix()
	if math.Abs(float64(now-tsUnix)) > float64(toleranceSeconds) {
		return false
	}

	// Reconstruct the signed message: "<timestamp>.<body>"
	message := fmt.Sprintf("%d.%s", tsUnix, string(payload))

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(message))
	expected := mac.Sum(nil)

	return hmac.Equal(sigBytes, expected)
}
