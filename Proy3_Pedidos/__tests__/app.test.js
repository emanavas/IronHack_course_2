// c:/Users/EmanuelNavas/My Drive/Education/WebApps-IronHack/IronHack_course_2/Proy2_Cursos/__tests__/app.test.js

const request = require('supertest');
const app = require('../index'); // Importamos la app desde index.js
const db = require('#root/config/db.js'); // Importamos la configuración de la BD


describe('GET /cursos', () => {
    // Después de todas las pruebas, cerramos la conexión a la BD.
    // afterAll(async () => {
    //     // Asumiendo que usas Sequelize, el objeto de conexión está en db.sequelize
    //     // Si usas sqlite3 directamente, la llamada puede ser db.close()
    //     if (db.sequelize) {
    //         await db.sequelize.close();
    //     }
    // });

    it('debería devolver la lista de cursos', async () => {
        const response = await request(app).get('/cursos/');
        expect(response.statusCode).toBe(200);
        // Como esta ruta renderiza HTML, podemos verificar que el contenido sea texto/html
        //expect(response.headers['content-type']).toMatch(/text\/html/);
    });
});



//------------------------------------------
// Asumo que tienes un modelo 'users' exportado desde db.js, similar a como tienes 'cursos'
const { usuarios } = db;

describe('Flujo de autenticación y rutas protegidas', () => {
  let agent;
  const testUser = {
    name: 'Test Admin',
    user: 'testadmin',
    password: 'password123',
    isAdmin: true,
  };

  // Antes de todas las pruebas, creamos un agente y un usuario de prueba en la BD
  beforeAll(async () => {
    // Creamos el agente que mantendrá las cookies
    agent = request.agent(app);

    // Limpiamos por si el usuario ya existe de una ejecución anterior
    await usuarios.destroy({ where: { user: testUser.user } });

    // Creamos el usuario de prueba
    await usuarios.create(testUser);
  });

  // Después de todas las pruebas, limpiamos el usuario y cerramos la conexión
  afterAll(async () => {
    await usuarios.destroy({ where: { user: testUser.user } });
    if (db.sequelize) {
      await db.sequelize.close();
    }
  });

  it('debería fallar al acceder a /cursos/admin sin iniciar sesión', async () => {
    const response = await request(app).get('/cursos/admin');
    // Sin sesión, el middleware 'isAdmin' debería redirigir o dar un error.
    // Asumamos que redirige a la página principal.
    expect(response.statusCode).toBe(302); // 302 es el código para redirección
    expect(response.headers.location).toBe('/');
  });

  it('debería permitir el login y luego acceder a /cursos/admin', async () => {
    // 1. Hacemos login con el agente. Usamos .send() para el body del POST.
    const loginResponse = await agent.post('/users/api/users/login').send({ user: testUser.user, password: testUser.password });
    expect(loginResponse.statusCode).toBe(200);

    // 2. Ahora, usamos el MISMO agente para acceder a la ruta protegida
    // El agente enviará la cookie de sesión automáticamente.
    const adminResponse = await agent.get('/cursos/admin');
    expect(adminResponse.statusCode).toBe(200);
    expect(adminResponse.text).toContain('Panel de Administración'); // Verifica que se renderice el contenido correcto
  });
});