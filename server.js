require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones seguras
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Requiere HTTPS en prod
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000 // 8 horas
    sameSite: 'none' // ✅ Necesario para Render
  }
}));

// Usuarios (en producción usa DB real como SQLite/PostgreSQL)
const users = {
  admin: {
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    name: 'Administrador'
  },
    juan: {
    passwordHash: '$2b$10$Ouc7AkX2hBzmtwe/7OrtbO2Vc3kp7NwSw.HktdOuv8FRhyxtfDeaC',
    name: 'Juan Perez'
  }
  
  // Agrega más usuarios aquí: 'maria': { passwordHash: '...', name: 'María López' }
};

// Lista de dashboards (todos ven los mismos por ahora)
const dashboards = [
  {
    id: 'ventas',
    name: '📊 Ventas OT y Cotización',
    description: 'Seguimiento de órdenes de trabajo y cotizaciones activas.',
    link: 'https://app.fabric.microsoft.com/view?r=eyJrIjoiZTE5MGVhNWQtNzYwYS00YmE0LTljNzUtOWMzM2E1MThlYjYwIiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9&embedImagePlaceholder=true'
  }
  // Agrega más aquí copiando el bloque
];

// Middleware de protección
const requireAuth = (req, res, next) => {
  if (!req.session?.isAuthenticated) return res.redirect('/login.html');
  next();
};

// Rutas
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.redirect('/login.html?error=1');

  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
      req.session.isAuthenticated = true;
      req.session.username = username;
      req.session.name = user.name;
      return res.redirect('/dashboard.html');
    }
    res.redirect('/login.html?error=1');
  } catch {
    res.redirect('/login.html?error=1');
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ username: req.session.username, name: req.session.name });
});

app.get('/api/dashboards', requireAuth, (req, res) => {
  res.json(dashboards);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`✅ Portal listo en http://localhost:${PORT}`);
  console.log(`🔒 En producción: usa HTTPS y cambia SESSION_SECRET`);
});