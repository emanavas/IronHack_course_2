const config = require("#config/main_config.js")
const { cursos } = require("#root/config/db.js"); // Importamos el modelo de Sequelize
const {isAdmin} = require("#root/config/middleware.js")
const { body, validationResult } = require('express-validator');





// --- Rutas Públicas ---

// GET /cursos/ -> Muestra todos los cursos públicos
config.router.get("/", async (req, res) => {
    try {
        // Sequelize: Busca todos los cursos donde la visibilidad sea 'publico'
        const cursosPublicos = await cursos.findAll({ where: { visibilidad: 'publico' } });
        res.render('cursos', { session: req.session, cursos: cursosPublicos });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener los cursos.");
    }
});

// GET /cursos/admin -> Panel de administración con todos los cursos
config.router.get("/admin", isAdmin, async (req, res) => {
    try {
        // Sequelize: Busca todos los cursos sin filtros
        const todosLosCursos = await cursos.findAll();
        res.render('admin/cursos', { session: req.session, cursos: todosLosCursos });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener los cursos para administración.");
    }
});

// GET /cursos/admin/nuevo -> Muestra el formulario para crear un nuevo curso
config.router.get("/admin/nuevo", isAdmin, (req, res) => {
    res.render('admin/nuevo-curso', { session: req.session, errors: [], oldData: {} });
});

// POST /cursos/admin/nuevo -> Procesa la creación de un nuevo curso
config.router.post("/admin/nuevo", isAdmin, 
    [ //validators
        body('titulo').notEmpty().withMessage('El título es obligatorio.').trim().escape(),
        body('descripcion').notEmpty().withMessage('La descripción es obligatoria.').trim().escape(),
        body('categoria').isIn(['Programación', 'Diseño', 'Marketing', 'Negocios']).withMessage('Categoría no válida.'),
        body('visibilidad').isIn(['publico', 'privado']).withMessage('Visibilidad no válida.')
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('admin/nuevo-curso', {
                session: req.session,
                errors: errors.array(),
                oldData: req.body
            });
        }

        const { titulo, descripcion, categoria, visibilidad } = req.body;
        try {
            // Sequelize: Crea una nueva fila en la tabla 'cursos'
            await cursos.create({ titulo, descripcion, categoria, visibilidad });
            res.redirect('/cursos/admin');
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al guardar el curso.");
        }
});

// GET /cursos/admin/editar/:id -> Muestra el formulario para editar un curso
config.router.get("/admin/editar/:id", isAdmin, async (req, res) => {
    try {
        // Sequelize: Busca un curso por su Primary Key (id)
        const curso = await cursos.findByPk(req.params.id);
        if (!curso) {
            return res.status(404).send("Curso no encontrado.");
        }
        res.render('admin/editar-curso', { session: req.session, curso: curso, errors: [] });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener el curso para editar.");
    }
});

// POST /cursos/admin/editar/:id -> Procesa la actualización de un curso
config.router.post("/admin/editar/:id", isAdmin, [
    body('titulo').notEmpty().withMessage('El título es obligatorio.').trim().escape(),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria.').trim().escape(),
    body('categoria').isIn(['Programación', 'Diseño', 'Marketing', 'Negocios']).withMessage('Categoría no válida.'),
    body('visibilidad').isIn(['publico', 'privado']).withMessage('Visibilidad no válida.')
], async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const curso = { id, ...req.body };
        return res.status(400).render('admin/editar-curso', {
            session: req.session,
            errors: errors.array(),
            curso: curso
        });
    }

    const { titulo, descripcion, categoria, visibilidad } = req.body;
    try {
        // Sequelize: Actualiza el curso que coincida con el 'where'
        await cursos.update(
            { titulo, descripcion, categoria, visibilidad },
            { where: { id: id } }
        );
        res.redirect('/cursos/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al actualizar el curso.");
    }
});

// POST /cursos/admin/eliminar/:id -> Elimina un curso
config.router.post("/admin/eliminar/:id", isAdmin, async (req, res) => {
    try {
        // Sequelize: Elimina el curso que coincida con el 'where'
        await cursos.destroy({ where: { id: req.params.id } });
        res.redirect('/cursos/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el curso.");
    }
});

module.exports = config.router;
