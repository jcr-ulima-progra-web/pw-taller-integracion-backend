import app from './app.js'
import sequelize from './src/config/database.js'

async function main() {
    try {
        const init = process.argv[2];

        if (init)
            await sequelize.sync({ force: true })
        else
            await sequelize.sync({ force: false })

        console.log('Base de datos sincronizada!')
        
        const port = 3005;

        app.listen(port, () => {
        console.log(`Server is running on port ${port}.`);
        });


    } catch (error) {
        console.log(error)
    }
}

main();

