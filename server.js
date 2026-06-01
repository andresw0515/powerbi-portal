require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

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
    maxAge: 8 * 60 * 60 * 1000, // 8 horas
    sameSite: 'lax' // ✅ Necesario para Render
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
  },
  
      noravarela: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        ricardovivas: {
    passwordHash: '$2b$10$hPcHCr1CUIjPOJJgpcMozeNPeA8M1UEasvhB8MyPjBEqOJJ3lKYoO',
    name: 'Ricardo Vivas'
  },

        gustavourrutia: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        luiscalderon: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        ernestomunch: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        victorordonez: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        brayanvalencia: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        ricardosalguero: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        jennypalacios: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
  },

        javierramos: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO',
    name: 'Nora Varela'
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
  },
    {
    id: 'inventario',
    name: '📊 Inventario Disponible',
    description: 'Seguimiento al inventario de la compañia.',
    link: 'https://app.fabric.microsoft.com/view?r=eyJrIjoiMGIzMTE5MDMtOWY1My00YjBkLWExOGUtNzJjY2E4MzdjNGE1IiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9'
  },
      {
    id: 'memos',
    name: '📊 Memorandos',
    description: 'Seguimiento al inventario de la compañia.',
    link: 'https://app.powerbi.com/view?r=eyJrIjoiY2FlZGVkM2QtOWZjNC00YmMzLWIzY2ItMGVlYTA4MTA0ODlhIiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9&embedImagePlaceholder=true'
  }
  // Agrega más aquí copiando el bloque
];

// Middleware de protección (CORREGIDO)
const requireAuth = (req, res, next) => {
  if (!req.session?.isAuthenticated) {
    // Si es petición API (fetch), retornar JSON 401
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    // Si es navegación normal, redirigir al login
    return res.redirect('/login.html');
  }
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