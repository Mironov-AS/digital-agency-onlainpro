-- PostgreSQL initialization script for Digital Agency
-- Creates schemas for each microservice

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS clients;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS shelf;
CREATE SCHEMA IF NOT EXISTS queue;

GRANT ALL ON SCHEMA auth TO agency;
GRANT ALL ON SCHEMA catalog TO agency;
GRANT ALL ON SCHEMA clients TO agency;
GRANT ALL ON SCHEMA projects TO agency;
GRANT ALL ON SCHEMA shelf TO agency;
GRANT ALL ON SCHEMA queue TO agency;
