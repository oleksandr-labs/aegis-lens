# aegis-sdk-go

Go client for the [Aegis Lens](https://aegislens.io) OSINT API.

## Installation

```bash
go get github.com/oleksandr-labs/aegis-sdk-go
```

## Quick start

```go
package main

import (
    "context"
    "fmt"
    "log"

    aegis "github.com/oleksandr-labs/aegis-sdk-go"
)

func main() {
    client := aegis.NewClient("ak_your_api_key")

    events, err := client.Events.List(context.Background(), aegis.EventFilter{
        Country: "UA",
        Hours:   24,
        Limit:   20,
    })
    if err != nil {
        log.Fatal(err)
    }
    for _, e := range events.Data {
        fmt.Printf("[%s] %s — danger %.2f\n", e.Class, e.Summary["en"], e.DangerScore)
    }
}
```

## Webhook verification

```go
ok := aegis.VerifyWebhookSignatureWithTimestamp(
    payload,
    r.Header.Get(aegis.SignatureHeader),
    webhookSecret,
    r.Header.Get(aegis.TimestampHeader),
    aegis.DefaultToleranceSeconds,
)
if !ok {
    http.Error(w, "invalid signature", http.StatusUnauthorized)
    return
}
```

## Resources

| Resource          | Methods                              |
|-------------------|--------------------------------------|
| `client.Events`   | `List(ctx, filter)`, `Get(ctx, id)`  |
| `client.Regions`  | `Get(ctx, iso2)`, `List(ctx)`        |

## Licence

MIT — see root `LICENSE`.
