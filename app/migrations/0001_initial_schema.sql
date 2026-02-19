CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_inputs (
  project_id TEXT PRIMARY KEY,
  period TEXT NOT NULL,
  annual_h2_output_kg REAL NOT NULL,
  electrolyser_capacity_kw REAL,
  feedstock_water_volume_per_kg_h2 REAL NOT NULL,
  feedstock_water_type TEXT NOT NULL,
  feedstock_upstream_lci_per_kg REAL NOT NULL,
  electricity_grid_kwh_per_kg_h2 REAL NOT NULL,
  electricity_renewable_kwh_per_kg_h2 REAL NOT NULL,
  electricity_other_kwh_per_kg_h2 REAL,
  electricity_grid_emission_factor_kg_co2_per_kwh REAL NOT NULL,
  electricity_t_and_d_loss_factor REAL NOT NULL,
  steam_steam_mj_per_kg_h2 REAL NOT NULL,
  steam_other_heat_mj_per_kg_h2 REAL,
  steam_steam_lci_kg_co2_per_mj REAL,
  steam_source TEXT NOT NULL,
  steam_emission_factor_kg_co2_per_mj REAL NOT NULL,
  co_product_allocation_method TEXT NOT NULL,
  co_product_allocation_lhv_h2_gas_mj_per_kg REAL NOT NULL,
  co_product_allocation_mass_h2_kg REAL NOT NULL,
  ccs_eccs_process_kg_co2_per_kg_h2 REAL,
  ccs_co2_sequestrated_kg_per_kg_h2 REAL,
  fuels_json TEXT NOT NULL DEFAULT '[]',
  input_materials_json TEXT NOT NULL DEFAULT '[]',
  co_product_allocation_lhv_json TEXT NOT NULL DEFAULT '[]',
  co_product_allocation_mass_json TEXT NOT NULL DEFAULT '[]',
  co_products_json TEXT,
  fugitive_non_co2_json TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS project_factor_overrides (
  project_id TEXT NOT NULL,
  factor_key TEXT NOT NULL,
  factor_value_json TEXT NOT NULL,
  PRIMARY KEY (project_id, factor_key),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS project_selected_methodologies (
  project_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  methodology_id TEXT NOT NULL,
  PRIMARY KEY (project_id, position),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES runs(id)
);
