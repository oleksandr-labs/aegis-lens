// Atlas configuration for Aegis Lens database migrations.
// https://atlasgo.io/atlas-schema/hcl

variable "db_url" {
  type    = string
  default = getenv("DATABASE_URL")
}

env "dev" {
  url = var.db_url
  migration {
    dir = "file://migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "prod" {
  url = getenv("DATABASE_URL_PROD")
  migration {
    dir    = "file://migrations"
    // Require lock_timeout to prevent long-running locks on prod
    lock_timeout = "5s"
  }
}

// Lint rules: block dangerous operations without explicit acknowledgement
lint {
  non_linear {
    error = true
  }
  data_depend {
    error = true
  }
  destructive {
    error = true
  }
}
