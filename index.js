const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js"); // 1. Cambiamos mysql2 por supabase

const app = express();
// 2. IMPORTANTE: Render asigna el puerto automáticamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 3127;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── Configuración Supabase ───────────────────────────────────────
// Reemplaza estos valores con los que aparecen en Settings > API de tu proyecto Supabase
const supabaseUrl = 'TU_URL_DE_SUPABASE';
const supabaseKey = 'TU_ANON_KEY_DE_SUPABASE';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── GET - Obtener todas las categorías ──────────────────────────
app.get("/api/categorias", async (req, res) => {
  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .order('id_categoria', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── GET - Obtener una categoría por ID ──────────────────────────
app.get("/api/categorias/:id", async (req, res) => {
  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .eq('id_categoria', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Categoría no encontrada" });
  res.json(data);
});

// ─── POST - Crear nueva categoría ────────────────────────────────
app.post("/api/categorias", async (req, res) => {
  const { descripcion } = req.body;
  if (!descripcion)
    return res.status(400).json({ error: "La descripción es obligatoria" });

  const { data, error } = await supabase
    .from('categoria')
    .insert([{ descripcion }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({
    mensaje: "Categoría creada correctamente",
    id: data[0].id_categoria,
  });
});

// ─── PUT - Actualizar categoría ───────────────────────────────────
app.put("/api/categorias/:id", async (req, res) => {
  const { descripcion } = req.body;
  if (!descripcion)
    return res.status(400).json({ error: "La descripción es obligatoria" });

  const { data, error } = await supabase
    .from('categoria')
    .update({ descripcion })
    .eq('id_categoria', req.params.id)
    .select();

  if (error || data.length === 0) 
    return res.status(404).json({ error: "Categoría no encontrada" });
    
  res.json({ mensaje: "Categoría actualizada correctamente" });
});

// ─── DELETE - Eliminar categoría ─────────────────────────────────
app.delete("/api/categorias/:id", async (req, res) => {
  const { error, count } = await supabase
    .from('categoria')
    .delete({ count: 'exact' })
    .eq('id_categoria', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: "Categoría eliminada correctamente" });
});

// ─── Inicio del servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en puerto ${PORT}`);
});
