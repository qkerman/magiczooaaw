const express = require('express')
const md5 = require('blueimp-md5')
const rooter = express.Router();
const app =  express();
const port = 3300;
const pg = require('pg');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require('cors');

const corsOption = {};
app.use(cors(corsOption));

dotenv.config();
console.log("connecting to", process.env.POSTGRESQL_ADDON_URI);
//Initialisation de la config de la base de données
const pgClient = new pg.Client(process.env.POSTGRESQL_ADDON_URI);
//Connection à la base de données
pgClient.connect(); 


// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));
app.use(cookieParser());

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

const getUser = async (nameUser, passUser) => {
    return new Promise(function(resolve, reject) {
    pgClient.query('SELECT id, name, password FROM public."user" WHERE name=$1 AND password=$2', [nameUser, passUser], (error, results) => {
        if (error) {
        reject(error)
        }
        resolve(results.rows);
    })
    }) 
}


// Ajout d'un animal
const addAnimal = async (nameAn,descrAn,enclosAn,imgAn) => {
    return new Promise(function(resolve, reject) {
    pgClient.query('INSERT INTO public.animaux(name, descr, enclos, img) VALUES ($1,$2,$3,$4)', [nameAn,descrAn,enclosAn,imgAn], (error, results) => {
        if (error) {
        reject(error)
        }
        resolve("success");
    })
    }) 
}

// Modification d'un animal
const editAnimal = async (idAn, nameAn, descrAn, enclosAn, imgAn) => {
    return new Promise(function(resolve, reject) {
    pgClient.query('UPDATE public.animaux SET name=$1, descr=$2, enclos=$3, img=$4 WHERE id=$5', [nameAn, descrAn, enclosAn, imgAn, idAn], (error, results) => {
        if (error) {
        reject(error)
        }
        resolve("success");
    })
    })
}


// Suppression d'un animal
const deleteAnimal = async (idAn) => {
    return new Promise(function(resolve, reject) {
    pgClient.query('DELETE FROM public.animaux WHERE id=$1', [idAn], (error, results) => {
        if (error) {
        reject(error)
        }
        resolve("success");
    })
    })
}


const getUserFromCookie = async (cookie) => {
    return new Promise(function(resolve, reject) {
    pgClient.query('SELECT t1.* FROM public."user" AS t1, public."connexions" AS t2 WHERE idcookie=$1 AND t1.name = t2.nameuser LIMIT 1', [cookie], (error, results) => {
        if (error) {
        reject(error)
        }
        resolve(results.rows);
    })
    })
}

const addConnexion = async (nameuser, idcookie) => {
    return new Promise(function(resolve, reject) {
    pgClient.query('INSERT INTO public."connexions"(nameuser, idcookie) VALUES ($1,$2)', [nameuser, idcookie], (error, results) => {
        if (error) {
        reject(error)
        }
        resolve("success")
    })
    }) 
}


const ifAdmin = async(req,res) => {
    const e = await getUserFromCookie(req.cookies["token"])
        if(e.length > 0){
            if(e[0]["privilege"] > 4){
                return true
            } else {
                return false
            }
        } else {
            return false
        }
}

app.use(express.json());
app.use(express.static('ressources'));
app.use(express.static('css'));
app.use(express.static('js'));


app.listen(port, () => {
})


// Get the favoris of the user
app.get('/api/animals/favoris',(req,res) => {
    const getFavoris = async () => {
        cookie = req.cookies["token"];
        getUserFromCookie(cookie).then((e) => {
            console.log(e)
            if(e.length > 0){
                nameUser = e[0]["name"];
                pgClient.query('SELECT * FROM public.favoris WHERE username=$1', [nameUser], (error, results) => {
                    // Send only the ids
                    ids = []
                    for (let i = 0; i < results.rows.length; i++) {
                        ids.push(results.rows[i]["idanimal"])
                    }
                    res.send(ids)
                })
            } else {
                res.send([])
            }
        })
    }

    getFavoris()
})




// Delete the favoris if the user is connected
app.get('/api/animals/favoris/delete/:id',(req,res) => {
    const deleteFavoris = async () => {
        cookie = req.cookies["token"];
        getUserFromCookie(cookie).then((e) => {
            console.log(e)
            if(e.length > 0){
                nameUser = e[0]["name"];
                pgClient.query('DELETE FROM public.favoris WHERE username=$1 AND idanimal=$2', [nameUser, req.params.id], (error, results) => {
                    res.send("Vous avez supprimé l'animal des favoris")
                })
            } else {
                res.send("error")
            }
        })
    }
    deleteFavoris()
})

// Add the favoris if the user is connected
app.get('/api/animals/favoris/add/:id',(req,res) => {
    const addFavoris = async () => {
        cookie = req.cookies["token"];
        getUserFromCookie(cookie).then((e) => {
            console.log(e)
            if(e.length > 0){
                nameUser = e[0]["name"];
                pgClient.query('INSERT INTO public.favoris(username, idanimal) VALUES ($1,$2)', [nameUser, req.params.id], (error, results) => {
                    res.send("Vous avez ajouté l'animal aux favoris")
                })
            } else {
                res.send("error")
            }
        })
    }
    addFavoris()
})

app.get('/api/connexion',(req,res) => {
    let options = {
        maxAge: 24 * 60 * 60 * 1000 * 600
    }

    getUser(req.query.username,md5(req.query.password))
    .then((result) => {
        exist = false;
        try{
            exist = result[0]['name'].length > 0;
        }
        catch(error){
            console.log(error)
        }
        if(exist){
            // Set cookie
            cookieId = create_UUID()
            res.cookie('token', cookieId, options)
            addConnexion(result[0]['name'], cookieId)
            res.send("Tu es désormais connecté");
        } else {
            res.send("Dommage, tu t'es tompé :3")
        }
    })
})

app.get('/api/register', (req,res)=> {
    let pseudo = req.query.username;
    let password = req.query.password;
    if(pseudo.length < 5){
        res.send("Username length must be over 5");
    } else if(pseudo.length > 15){
        res.send("Username length must be under 15" + pseudo.length);
    } else if(!/^[0-9a-zA-Z]*$/.test(pseudo)){
        res.send("Username must be composed by latin letters or numbers");
    } else if(password.length < 5){
        res.send("Password length must be over 5");
    } else if(password.length > 255){
        res.send("Password length must be under 255");
    } else {
        password = md5(password);
        pgClient.query('INSERT INTO public.user (name, password) VALUES ($1, $2)', [pseudo, password], function(error, results, fields) {
            if (error) {
                res.send("Username already used or internal error");
            }
            else {
                res.send("Weclome to the MagicZOO " + pseudo + " !");
            }
        });
    }
})

app.get('/api/admin', async (req, res) => {
    const isAdmin = await ifAdmin(req,res)
    if(isAdmin){
        res.send("yes")
    } else {
        res.send("no")
    }
})


// Add animal if the user is admin
app.get('/api/animal/add', async (req, res) => {
    const isAdmin = await ifAdmin(req,res)
    if(isAdmin){
        addAnimal(req.query.namean, req.query.descran, req.query.enclosan, req.query.imgan)
        .then((result) => {
            exist = false;
            try{
                exist = (result == "success");
            }
            catch(error){
                console.log(error)
            }
            if(exist){
                res.send("Bien ouej fréro !");
            } else {
                res.send("L'animal n'a pas survécu à son environnement...")
            }
        })
        } else {
        res.send("Non non non")
    }
})

// Edit animal if the user is admin
app.get('/api/animal/edit', async (req, res) => {
    console.log(req.query)
    const isAdmin = await ifAdmin(req,res)
    if(isAdmin){
        editAnimal(req.query.id, req.query.namean, req.query.descran, req.query.enclosan, req.query.imgan)
        .then((result) => {
            exist = false;
            try{
                exist = (result == "success");
            }
            catch(error){
                console.log(error)
            }
            if(exist){
                res.send("Bien ouej fréro !");
            } else {
                res.send("L'animal ne veut pas qu'on le modifie...")
            }
        })
        } else {
        res.send("Non non non")
    }
})


// Delete animal if the user is admin
app.get('/api/animal/delete/:id', async (req, res) => {
    const isAdmin = await ifAdmin(req,res)
    if(isAdmin){
        deleteAnimal(req.params.id)
        .then((result) => {
            exist = false;
            try{
                exist = (result == "success");
            }
            catch(error){
                console.log(error)
            }
            if(exist){
                res.send("L'animal a été supprimé");
            } else {
                res.send("L'animal a survécu...")
            }
        })
        } else {
        res.send("Non non non")
    }
})

// Get all animals
app.get("/api/animals", (req, res)=>{
    const animals = async () => {
        return new Promise(function (resolve, reject) {
            pgClient.query('SELECT * FROM animaux', (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve(results.rows);
            })
        })};
    animals()
        .then(result => {
            res.send(result)
        })
})

// Get one animal by id
app.get("/api/animals/:id", (req, res)=>{
    const animal = async () => {
        return new Promise(function (resolve, reject) {
            pgClient.query('SELECT * FROM animaux WHERE id = $1', [req.params.id], (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve(results.rows);
            })
        })};
    animal()
        .then(result => {
            res.send(result)
        })
})


app.get('/api/session',(req,res) => { 
    getUserFromCookie(req.cookies['token']).then((e) =>{
        if(e.length > 0){
            res.send(e[0]['name'])
        } else {
            res.send()
        }
    })
})

app.get('/api/logout',(req,res) => {
    res.clearCookie("token");
    res.redirect('/');
});

app.get("/api/events", (req, res)=>{
   res.send(events)
});

app.get("/api/manche", (req, res)=>{
    getEvent()
        .then((e) => res.send(e))
 });

app.use('/', express.static("public"))
