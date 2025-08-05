const config = require("#config/main_config.js")
const { courses, subscriptions } = require("#root/config/db.js"); // Importamos el modelo de Sequelize
const {isAdmin,decodeToken} = require("#root/config/middleware.js")
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const multer = require('multer');

// Configure multer for memory storage to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




// GET /cursos/ -> Muestra todos los cursos públicos
config.router.get("/", async (req, res) => {
    const token = decodeToken(req.session?.token)
    try {
        // Sequelize: Busca todos los cursos donde is_public sea true
        //check if is register user and create query
        let query_builder = [{ is_public:true }]
        if(token?.userId){
            query_builder.push({ userId: token.userId })
        }
        const allCourses = await courses.findAll({ where: {
            [Op.or]: query_builder
        }});

        let userSubscriptions = [];
        if (token?.userId) {
            const subs = await subscriptions.findAll({
                where: { userId: token.userId },
                attributes: ['courseId']
            });
            userSubscriptions = subs.map(s => s.courseId);
        }

        console.log(token)
        res.render('index', { token: token, courses: allCourses, userSubscriptions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener los cursos.");
    }
});

// POST /courses/:id/subscribe -> Subscribes a user to a course
config.router.post("/:id/subscribe", async (req, res) => {
    const token = decodeToken(req.session?.token);
    if (!token?.userId) {
        return res.status(401).render('login', { errors: "You must be logged in to subscribe." });
    }

    try {
        const courseId = parseInt(req.params.id, 10);
        // This will fail if the user is already subscribed, assuming a unique constraint on (userId, courseId)
        await subscriptions.create({ userId: token.userId, courseId });
        res.redirect('/courses');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error subscribing to the course. You might be already subscribed.");
    }
});

//-----------------------------------------------------------


// GET /cursos/admin -> Panel de administración con todos los cursos
config.router.get("/new", isAdmin,
    async (req, res) => {
    try {
        //check if has token
        res.render('courses-new', { token: decodeToken(req.session?.token) });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error no ha sido posible gestionar peticion.");
    }
});

// POST /cursos/admin/nuevo -> Procesa la creación de un nuevo curso
config.router.post("/new", isAdmin, upload.single('image'),
    [ //validators
        body('title').notEmpty().withMessage('Title is required.').trim().escape(),
        body('description').notEmpty().withMessage('Description is required.').trim().escape(),
        body('category').notEmpty().withMessage('Catgory is requiere'),
        body('is_public').isBoolean().withMessage('need to be boolean')
    ], async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new Error(errors.array().map(error => `${error?.path}: ${error?.msg}\n<br>`).join(''));
            }
            const { title, description, category, is_public } = req.body;
            
            // Sequelize: Crea una nueva fila en la tabla 'cursos'
            await courses.create({ userId:req.session?.token_data?.userId,
                title: title,
                description: description,
                category: category,
                is_public: is_public,
                image: req.file ? req.file.buffer : null
            });

            res.redirect('/courses');
        } catch (error) {
            return res.status(400).render('courses-new', {
                session: req.session,
                errors: error.message,
                oldData: req.body
            });
        }
});

//--------------------------------------------------------------------------------------

// GET /cursos/admin/nuevo -> Muestra el formulario para crear un nuevo curso
config.router.get("/admin/nuevo", isAdmin, (req, res) => {
    res.render('admin/nuevo-curso', { session: req.session, errors: [], oldData: {} });
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
    body('is_public').isBoolean().withMessage('Visibilidad no válida.')
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

    const { title, description, category, is_public } = req.body;
    try {
        // Sequelize: Actualiza el curso que coincida con el 'where'
        await cursos.update(
            { title: title, description: description, category: category, is_public:is_public },
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
