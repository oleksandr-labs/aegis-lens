import "server-only";
/**
 * Event bus abstraction — decouples services from the underlying broker.
 *
 * Two implementations:
 *   InMemoryEventBus  — dev / test; events stay in-process (no persistence)
 *   KafkaEventBus     — production; uses kafkajs against KAFKA_BOOTSTRAP_SERVERS
 *
 * The module auto-selects based on NODE_ENV / KAFKA_BOOTSTRAP_SERVERS:
 *   - If KAFKA_BOOTSTRAP_SERVERS is set → KafkaEventBus
 *   - Otherwise → InMemoryEventBus
 *
 * Topics used by Aegis Lens:
 *   aegis.events.raw        ingest pipeline raw events
 *   aegis.events.verified   post-verification events
 *   aegis.events.retracted  retracted events
 *   aegis.alerts.triggered  alert fan-out
 *   aegis.reports.ready     report generation complete
 *   aegis.email.bounce      email bounce events (→ suppression list)
 *   aegis.email.complaint   email complaint events (→ suppression list)
 *
 * Абстракція шини подій: InMemoryEventBus для розробки,
 * KafkaEventBus для продакшну.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EventBusMessage<T = unknown> {
  /** Kafka topic or named channel. */
  topic: string;
  /**
   * Message key for partitioning (e.g. event ID, region code).
   * Ensures messages with the same key go to the same partition → ordering.
   */
  key?: string;
  /** Message payload. */
  value: T;
  /** Optional headers (e.g. source, correlation-id, content-type). */
  headers?: Record<string, string>;
}

export interface EventBus {
  /**
   * Publish a message to the given topic.
   * Returns when the broker has acknowledged receipt (or immediately for in-memory).
   */
  publish<T>(message: EventBusMessage<T>): Promise<void>;

  /**
   * Subscribe to a topic within a consumer group.
   * Each message in the topic is delivered to exactly one member of the group.
   *
   * @param topic    - Topic to subscribe to.
   * @param groupId  - Consumer group identifier (e.g. "report-svc").
   * @param handler  - Called for each message; throw to NACK / retry.
   */
  subscribe<T>(
    topic: string,
    groupId: string,
    handler: (message: T) => Promise<void>,
  ): Promise<void>;

  /** Graceful shutdown — flush pending messages and disconnect. */
  disconnect(): Promise<void>;
}

// ── In-memory implementation ──────────────────────────────────────────────────

type SubscriberMap<T> = Array<{
  groupId: string;
  handler: (message: T) => Promise<void>;
}>;

export class InMemoryEventBus implements EventBus {
  // biome-ignore lint/suspicious/noExplicitAny
  private readonly subscribers = new Map<string, SubscriberMap<any>>();

  async publish<T>(message: EventBusMessage<T>): Promise<void> {
    const subs = this.subscribers.get(message.topic) ?? [];
    // Fan out to all registered handlers (in-memory has no consumer groups)
    await Promise.all(subs.map((sub) => sub.handler(message.value)));
  }

  async subscribe<T>(
    topic: string,
    groupId: string,
    handler: (message: T) => Promise<void>,
  ): Promise<void> {
    const existing = (this.subscribers.get(topic) as SubscriberMap<T>) ?? [];
    existing.push({ groupId, handler });
    this.subscribers.set(topic, existing);
  }

  async disconnect(): Promise<void> {
    this.subscribers.clear();
  }
}

// ── Kafka implementation (requires kafkajs) ───────────────────────────────────

/**
 * Production Kafka event bus via kafkajs.
 *
 * Install: npm install kafkajs
 *
 * Environment variables:
 *   KAFKA_BOOTSTRAP_SERVERS   — comma-separated broker list (e.g. "localhost:9092")
 *   KAFKA_CLIENT_ID           — client identifier (default: "aegis-web")
 *   KAFKA_SASL_USERNAME       — optional SASL/PLAIN username
 *   KAFKA_SASL_PASSWORD       — optional SASL/PLAIN password
 *
 * Реалізація через kafkajs для продакшн-середовища.
 */
export class KafkaEventBus implements EventBus {
  // biome-ignore lint/suspicious/noExplicitAny
  private kafka: any = null; // kafkajs Kafka instance (lazy import)
  // biome-ignore lint/suspicious/noExplicitAny
  private producer: any = null;
  private readonly bootstrapServers: string;
  private readonly clientId: string;

  constructor(
    bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS ?? "localhost:9092",
    clientId = process.env.KAFKA_CLIENT_ID ?? "aegis-web",
  ) {
    this.bootstrapServers = bootstrapServers;
    this.clientId = clientId;
  }

  // biome-ignore lint/suspicious/noExplicitAny
  private async getKafka(): Promise<any> {
    if (this.kafka) return this.kafka;
    // Dynamic import — kafkajs is optional; falls back to in-memory
    try {
      const { Kafka } = await import("kafkajs");
      this.kafka = new Kafka({
        clientId: this.clientId,
        brokers: this.bootstrapServers.split(","),
        ...(process.env.KAFKA_SASL_USERNAME
          ? {
              sasl: {
                mechanism: "plain",
                username: process.env.KAFKA_SASL_USERNAME,
                password: process.env.KAFKA_SASL_PASSWORD ?? "",
              },
            }
          : {}),
      });
    } catch {
      throw new Error(
        "kafkajs not installed. Run: npm install kafkajs. " +
          "Or unset KAFKA_BOOTSTRAP_SERVERS to use the in-memory bus.",
      );
    }
    return this.kafka;
  }

  async publish<T>(message: EventBusMessage<T>): Promise<void> {
    const kafka = await this.getKafka();
    if (!this.producer) {
      this.producer = kafka.producer();
      await this.producer.connect();
    }

    await this.producer.send({
      topic: message.topic,
      messages: [
        {
          key: message.key ?? null,
          value: JSON.stringify(message.value),
          headers: message.headers ?? {},
        },
      ],
    });
  }

  async subscribe<T>(
    topic: string,
    groupId: string,
    handler: (message: T) => Promise<void>,
  ): Promise<void> {
    const kafka = await this.getKafka();
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({
        message,
      }: {
        message: { value: Buffer | null };
      }) => {
        if (!message.value) return;
        const parsed = JSON.parse(message.value.toString("utf8")) as T;
        await handler(parsed);
      },
    });
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
  }
}

// ── Auto-select singleton ─────────────────────────────────────────────────────

/**
 * Module-level event bus singleton.
 * Automatically selects KafkaEventBus when KAFKA_BOOTSTRAP_SERVERS is set.
 *
 * Автоматично обирає реалізацію залежно від середовища.
 */
export const eventBus: EventBus = process.env.KAFKA_BOOTSTRAP_SERVERS
  ? new KafkaEventBus()
  : new InMemoryEventBus();

// ── Topic constants ───────────────────────────────────────────────────────────

export const TOPICS = {
  EVENTS_RAW: "aegis.events.raw",
  EVENTS_VERIFIED: "aegis.events.verified",
  EVENTS_RETRACTED: "aegis.events.retracted",
  ALERTS_TRIGGERED: "aegis.alerts.triggered",
  ALERTS_RESOLVED: "aegis.alerts.resolved",
  AOIS_ENTERED: "aegis.aois.entered",
  AOIS_EXITED: "aegis.aois.exited",
  INGEST_RAW: "aegis.ingest.raw",
  REPORTS_READY: "aegis.reports.ready",
  EMAIL_BOUNCE: "aegis.email.bounce",
  EMAIL_COMPLAINT: "aegis.email.complaint",
} as const;

export type TopicName = (typeof TOPICS)[keyof typeof TOPICS];
