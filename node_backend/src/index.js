const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const routes = require('./routes');
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

sequelize.authenticate().then(() => {
    console.log("Connexion à la base de données Django.");
    app.listen(PORT, () => console.log(`Node.js running on port ${PORT}`));
}).catch(err => console.error("Erreur de connexion :", err));