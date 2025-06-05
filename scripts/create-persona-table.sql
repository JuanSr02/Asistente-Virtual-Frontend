-- Script para crear la tabla persona correctamente
-- Ejecuta esto en tu editor SQL de Supabase

-- Eliminar la tabla si existe (cuidado con los datos!)
-- DROP TABLE IF EXISTS persona;

-- Crear la tabla persona con las columnas correctas
CREATE TABLE IF NOT EXISTS persona (
  id SERIAL PRIMARY KEY,
  mail VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('ESTUDIANTE', 'ADMINISTRADOR')) DEFAULT 'ESTUDIANTE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_persona_mail ON persona(mail);

-- Habilitar Row Level Security (RLS)
ALTER TABLE persona ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propia información
CREATE POLICY "Users can view own data" ON persona
FOR SELECT USING (auth.email() = mail);

-- Política para que los usuarios puedan insertar su propia información
CREATE POLICY "Users can insert own data" ON persona
FOR INSERT WITH CHECK (auth.email() = mail);

-- Política para que los usuarios puedan actualizar su propia información
CREATE POLICY "Users can update own data" ON persona
FOR UPDATE USING (auth.email() = mail);

-- Insertar algunos usuarios de ejemplo (opcional)
INSERT INTO persona (mail, nombre, role) VALUES 
('admin@ejemplo.com', 'Administrador', 'ADMINISTRADOR'),
('estudiante@ejemplo.com', 'Estudiante Ejemplo', 'ESTUDIANTE')
ON CONFLICT (mail) DO NOTHING;

-- Verificar que la tabla se creó correctamente
SELECT * FROM persona;
