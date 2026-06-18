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
  andreswong: {
    passwordHash: '$2b$10$UnUSCbGaburMp1ivUTiLU.2I8RpkWGNzxJXBsC56Jec0Ki0VV2czy', //computador15
    name: 'Andrés Wong',
    roles: ['admin']
  },
  
      noravarela: {
    passwordHash: '$2b$10$3PZBUci9S7yKl64jmd2Z8ufiiRoW6aUtaGZmlDM.INm5E9Nbat4tO', //MariaAleja*2023
    name: 'Nora Varela',
    roles: ['admin']
  },

        ricardovivas: {
    passwordHash: '$2b$10$hPcHCr1CUIjPOJJgpcMozeNPeA8M1UEasvhB8MyPjBEqOJJ3lKYoO', //12345
    name: 'Ricardo Vivas',
    roles: ['admin']
  },

        gustavourrutia: {
    passwordHash: '$2b$10$nyNciK3PP8fX3kot6YCRrez/czSqWbOOrC7/07SBda0XVb2bnAfUy', //Padre@14
    name: 'Gustavo Urrutia',
    roles: ['admin']
  },

        luiscalderon: {
    passwordHash: '$2b$10$G.4urDT/bPE3V5nQoii01.chzaTQguSJUCDECDCsv4u/9OFwczlyC', //lacc0625
    name: 'Luis Calderon',
    roles: ['admin']
  },
        marcelacartagena: {
    passwordHash: '$2b$10$cb.dYGCXaht7bH7eno3sE.RWiT.fAYoc4BLVuA0a4udC9AwRb5b0a', //Celco2025*
    name: 'Marcela Cartagena',
    roles: ['compras']
  },
          andresmunoz: {
    passwordHash: '$2b$10$rcy88AiD.evjMm61LwWfHup0MUH9rZU/dQ/FX47kuNchZQlj.g9ze', //5503
    name: 'Andres Muñoz',
    roles: ['admin']
  }
  // Agrega más usuarios aquí: 'maria': { passwordHash: '...', name: 'María López' }
};

// Lista de dashboards (todos ven los mismos por ahora)
const dashboards = [
  {
    id: 'ventas',
    name: '📊 Ventas OT y Cotización',
    description: 'Seguimiento de órdenes de trabajo y cotizaciones activas.',
    link: 'https://app.fabric.microsoft.com/view?r=eyJrIjoiZTE5MGVhNWQtNzYwYS00YmE0LTljNzUtOWMzM2E1MThlYjYwIiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9&embedImagePlaceholder=true',
    roles: ['ventas','admin']
  },
    {
    id: 'inventario',
    name: '📊 Inventario Disponible',
    description: 'Seguimiento al inventario de la compañia.',
    link: 'https://app.fabric.microsoft.com/view?r=eyJrIjoiMGIzMTE5MDMtOWY1My00YjBkLWExOGUtNzJjY2E4MzdjNGE1IiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9',
    roles: ['compras','admin']
  },
      {
    id: 'memos',
    name: '📊 Memorandos',
    description: 'Seguimiento a los memos realizados',
    link: 'https://app.powerbi.com/view?r=eyJrIjoiY2FlZGVkM2QtOWZjNC00YmMzLWIzY2ItMGVlYTA4MTA0ODlhIiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9&embedImagePlaceholder=true',
    roles: ['compras','admin',]
  },
        {
    id: 'consumos',
    name: '📊 Compras',
    description: 'Seguimiento a los componentes pendientes de comprar.',
    link: 'https://app.fabric.microsoft.com/view?r=eyJrIjoiZGY4OTEwODMtYWIzZi00YzFhLTljMWMtNzUxNDVmZDNjZWFmIiwidCI6IjQ4ODdlZTBhLTk2M2UtNDk3MS04NTk5LWNhZGZlMTMwOTdiYiJ9',
    roles: ['compras','admin']
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
      req.session.roles = user.roles; //  NUEVO: Guardar roles en sesión
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
  const userRoles = req.session.roles || [];
  const esAdmin = userRoles.includes('admin');

  const dashboardsVisibles = dashboards.filter(d => {
    if (esAdmin) return true; // ✅ Admin ve TODOS los dashboards
    
    // ✅ Otros usuarios: solo ven si comparten al menos 1 rol
    const dashboardRoles = d.roles || [];
    return dashboardRoles.some(rol => userRoles.includes(rol));
  });

  res.json(dashboardsVisibles);
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