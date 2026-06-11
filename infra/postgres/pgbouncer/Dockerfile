FROM pgbouncer/pgbouncer:1.22.1

# Copy configuration (secrets injected at runtime via ENV or mounted secrets)
COPY pgbouncer.ini /etc/pgbouncer/pgbouncer.ini

# Healthcheck: try to connect to the admin console
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD psql "host=127.0.0.1 port=6432 dbname=pgbouncer user=pgbouncer_admin password=${PGBOUNCER_ADMIN_PASSWORD}" \
      -c "SHOW POOLS;" > /dev/null 2>&1 || exit 1

EXPOSE 6432

CMD ["/usr/bin/pgbouncer", "/etc/pgbouncer/pgbouncer.ini"]
