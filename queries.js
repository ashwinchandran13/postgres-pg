const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.row);
    })
}

const createUser = (request, response) => {
    const { name, email, teamid } = request.body;
    // Inserting data into user
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id', [name, email], (error, results) => {
        if (error) {
            throw error;
        }
        const userid = parseInt(results.rows[0].id, 10);
        console.log(userid);
    //Inserting teamid into pivot table
        pool.query('INSERT INTO user_team_rel VALUES ($1, $2)', [userid, teamid], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`User and Team id added: ${userid} : ${teamid}`);
        })   
    }) 
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, email } = request.body;

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [ name, email, id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`User modified with ID: ${id}`);
        }
    );
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM users WHERE id = $1', [ id ], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`User deleted with ID: ${id}`);
    })
}

const createTeam = (request, response) => {
    const teamName = request.body;

    pool.query('INSERT INTO teams (teamname) VALUES ($1)', [ teamName ], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`User Added`);
    })
}

const findTeam = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('SELECT T.teamname from teams as T INNER JOIN user_team_rel as u ON T.teamid = u.teamid WHERE u.userid = $1', [ id ], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    })

}

const addTeam = (request, response) => {
    const userid = parseInt(request.params.userid);
    const teamid = parseInt(request.params.teamid);

    const userIdNotFound = 0;
    const teamIdNotFound = 0;

    // checking if userid and teamid exists within users and teams table
    pool.query('SELECT id FROM users WHERE id = $1', [ userid ], (error, results) => {
        if (error) {
            throw error;
        }
        const resp_userid = results.rows;
        if (resp_userid == '') {
            userIdNot5432Found ++;
        }
    })

    pool.query('SELECT teamid FROM teams WHERE teamid = $1', [ teamid ], (error, results) => {
        if (error) {
            throw error;
        }
        const resp_teamid = results.rows;
        if (resp_teamid == '') {
            teamIdNotFound ++;
        }
    })

    if ( userIdNotFound == 1 && teamIdNotFound == 1 ) {
        response.status(400).send("User Id and Team Id not found");
    }
    else if ( userIdNotFound == 1 && teamIdNotFound == 0 ) {
        response.status(400).send("User Id not found");
    }
    else if ( userIdNotFound == 0 && teamIdNotFound == 1 ) {
        response.status(400).send("Team Id not found");
    }
    else {
        pool.query('INSERT INTO user_team_rel VALUES($1, $2)', [ userid, teamid], (error, results) => {
            response.status(200).send("User Id and Team Id inserted successfully");
            if (error) {
                throw error;
            }
        })  
    }
    
}




module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    createTeam,
    findTeam,
    addTeam,
}