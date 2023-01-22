// Ici c'est le gros fichier du projet : il contient toutes les requêtes AJAX, les fonctions de chargement de page, etc.

// Fonction qui permet de charger la page en fonction de l'URL (#animal, #inscription, #connexion, etc.)
function setMainFromUrl(){
    loc = window.location.href;
    switch (loc) {
        case (window.location.origin):
            requestHTML('/main.html', 'main', true);
            break;
        case (window.location.origin + "/"):
            requestHTML('/main.html', 'main', true);
            break;
        case (window.location.origin + "/#"):
            requestHTML('/main.html', 'main', true);
            break;
        case (window.location.origin + "/#animal"):
            showAnimalsConnected();
            requestHTML('/animals.html', 'main', true);
            break;
        case (window.location.origin + "/#addanimal"):
            showAddAnimal();
            break;
        case (window.location.origin + "/#inscription"):
            showInscription();
            break;
        case (window.location.origin + "/#connexion"):
            showConnexion();
            break;
        case (window.location.origin + "/#enclos"):
            showEnclos();
            break;
        default:
            requestHTML('/main.html', 'main', true);
            break;
      }
}

// Fonction qui permet de charger la page sur l'élément id
function request(page, id){
    fetch(page).then((e) => e.text()).then((text) => {
        document.getElementById(id).innerText = text;
        setTimeout(() => {
            window.location.replace(window.location.origin + "/#");
            showForConnexion();
            setMainFromUrl();
        }, "1000")
    });
} 

// Même fonction que request mais sans le reload (et les fonctions de chargement de page)
function requestNoReload(page, id){
    fetch(page).then((e) => e.text()).then((text) => {
        document.getElementById(id).innerText = text;
    });
}

// Nous avons eu des problèmes avec la fonction request, donc nous avons fait une fonction requestHTML qui permet de charger la page sur l'élément id en utilisant XMLHttpRequest et non fetch
function requestHTML(page, id, replace){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.status == 200 && xhr.readyState == 4) {
            if(replace){
                document.getElementById(id).innerHTML = xhr.responseText;
            } else {
                document.getElementById(id).innerHTML = xhr.responseText + document.getElementById(id).innerHTML;
            }
            showMainAnimals();
        }
    };
    xhr.open('GET', page);
    xhr.send('');
} 

// Fonction qui envoie une requête AJAX pour ajouter un nouvel animal
function sendNewAnimal(){
    nameAn = document.getElementById("nameAn").value;
    imgAn = document.getElementById("imgAn").value;
    enclosAn = document.getElementById("enclosAn").value;
    descrAn = document.getElementById("descrAn").value;
    requestNoReload('/api/animal/add?namean=' + nameAn + '&imgan=' + imgAn + '&enclosan=' + enclosAn + '&descran=' + descrAn, "answer");
    document.getElementById("nameAn").value = '';
    document.getElementById("imgAn").value = '';
    document.getElementById("enclosAn").value = '';
    document.getElementById("descrAn").value = '';
}

// Fonction qui envoie une requête AJAX faire la connexion d'un utilisateur
function sendConnexion(){
    username = document.getElementById("nameConnexion");
    password = document.getElementById("passConnexion");
    request('/api/connexion?username=' + username.value + '&password=' + password.value + '', "answer");
    username.value='';
    password.value='';
}

// Pareil que sendConnexion mais pour l'inscription
function sendInscription(){
    username = document.getElementById("nameInscription");
    password = document.getElementById("passInscription");
    request('/api/register?username=' + username.value + '&password=' + password.value + '', "answer");
    username.value='';
    password.value='';
}

// Juste l'affichage de la page d'inscription (avec le formulaire, sans ajax)
function showInscription(){
    main = document.getElementById("main");
    main.innerHTML = `
    <section class="jumbotron text-center">
        <div class="container"><center>
            <h1 class="jumbotron-heading">Inscription</h1><br>
            <div id="answer"></div><br>
            <form>
                <div class="form-group">
                    <label for="exampleInputUsername1">Username</label>
                    <input type="text" class="form-control" id="nameInscription" aria-describedby="emailHelp" placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" class="form-control" id="passInscription" placeholder="Password">
                </div>
                <a style="color:white;" class="btn btn-primary" onclick="sendInscription()">Valider</a>
            </form>
        </center></div>
    </section>
    `
    showMainAnimals();
}

// Pareil que showInscription mais pour la connexion
function showConnexion(){
    main = document.getElementById("main");
    main.innerHTML = `
    <section class="jumbotron text-center">
        <div class="container"><center>
            <h1 class="jumbotron-heading">Connexion</h1><br>
            <div id="answer"></div><br>
            <form>
                <div class="form-group">
                    <label for="exampleInputUsername1">Username</label>
                    <input type="text" class="form-control" id="nameConnexion" aria-describedby="emailHelp" placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" class="form-control" id="passConnexion" placeholder="Password">
                </div>
                <a style="color:white;" class="btn btn-primary" onclick="sendConnexion()">Valider</a>
            </form>
        </center></div>
    </section>
    `
    showMainAnimals();
}

// Fonction qui montre le formulaire pour éditer un animal
function showEditAnimal(id){
    // On récupère les informations de l'animal
    fetch('/api/animals/' + id).then((e) => e.json()).then((text) => {
        // On affiche le formulaire (avec les informations de l'animal)

        var html = `
        <section class="jumbotron text-center">
            <div class="container"><center>
                <h1 class="jumbotron-heading">Modifier un animal</h1><br>
                <div id="answer"></div><br>
                <form>
                    <div class="form-group">
                        <label for="text">Nom</label>
                        <input type="text" class="form-control" id="nameAn" aria-describedby="emailHelp" placeholder="Enter name" value="` + text[0]['name'] + `">
                    </div>
                    <div class="form-group">
                        <label for="text">Image</label>
                        <input type="text" class="form-control" id="imgAn" aria-describedby="emailHelp" placeholder="Enter image" value="` + text[0]['img'] + `">
                    </div>
                    <div class="form-group">
                        <label for="text">Enclos</label>
                        <input type="text" class="form-control" id="enclosAn" aria-describedby="emailHelp" placeholder="Enter enclos" value="` + text[0]['enclos'] + `">
                    </div>
                    <div class="form-group">
                        <label for="text">Description</label>
                        <input type="text" class="form-control" id="descrAn" aria-describedby="emailHelp" placeholder="Enter description" value="` + text[0]['descr'] + `">
                    </div>
                    <a style="color:white;" class="btn btn-primary" onclick="sendEditAnimal(` + id + `)">Valider</a>
                </form>
            </center></div>
        </section>
        `
        // On affiche le formulaire
        document.getElementById("main").innerHTML = html;
    });
}

// La fonction qui envoie les informations pour éditer un animal
function sendEditAnimal(id){
    nameAn = document.getElementById("nameAn").value;
    imgAn = document.getElementById("imgAn").value;
    enclosAn = document.getElementById("enclosAn").value;
    descrAn = document.getElementById("descrAn").value;
    alert(nameAn + imgAn + enclosAn + descrAn);
    requestNoReload('/api/animal/edit?id=' + id + '&namean=' + nameAn + '&imgan=' + imgAn + '&enclosan=' + enclosAn + '&descran=' + descrAn, "answer");
    document.getElementById("nameAn").value = '';
    document.getElementById("imgAn").value = '';
    document.getElementById("enclosAn").value = '';
    document.getElementById("descrAn").value = '';
    setTimeout(showAnimals, 1000);
}

// Fonction qui montre le formulaire pour ajouter un animal
function showAddAnimal(){
    main = document.getElementById("main");
    main.innerHTML = `
    <section class="jumbotron text-center">
        <div class="container"><center>
            <h1 class="jumbotron-heading">Ajouter animal</h1><br>
            <div id="answer"></div><br>
            <form>
                <div class="form-group">
                    <label>Nom animal</label>
                    <input type="text" class="form-control" id="nameAn" placeholder="ex: éléphant">
                </div>
                <div class="form-group">
                    <label>Numéro enclos</label>
                    <input type="text" class="form-control" id="enclosAn" placeholder="ex: 1,2...">
                </div>
                <div class="form-group">
                    <label>Image de l'animal</label>
                    <input type="text" class="form-control" id="imgAn" placeholder="ex: https://img.com/img.png">
                </div>
                <div class="form-group">
                    <label>Description de l'animal</label>
                    <textarea class="form-control" id="descrAn" rows="3" placeholder="ex: animal inutile.."></textarea>
                </div>
                <a style="color:white;" class="btn btn-primary" onclick="sendNewAnimal()">Valider</a>
            </form>
        </center></div>
    </section>
    `
    showMainAnimals();
}

// Fonction qui envoie les informations pour montrer les animaux (d'abord la page de la page puis le remplissage)
function showAnimals(){
    requestHTML('/animals.html', 'main', true);
    showAnimalsConnected();
}

// Fonction qui montre les enclos remplis, je te passe les bidouillages pour l'affichage des animaux aux bons endroits :'(
function showEnclos(){
    requestHTML('/enclos.html', 'main', true);
    fetch('/api/animals').then((e) => e.json()).then((text) => {
        for(i = 0; i < text.length; i++){
            enclos = text[i]['enclos'];
            positionY = Math.round(enclos/10);
            positionX = (enclos%10);
            // Add text element to the enclos with relative position
            // Add element
            var div = document.createElement("div");
            div.id = "animal" + text[i]['id'];
            div.style.width = "9vw";
            div.style.height = "9vw";
            // place the element with relative position from the top left of the div
            div.style.position = "relative";
            div.style.top = (positionY*10 - 9*i) + "vw";
            div.style.left = (positionX*10) + "vw";
            div.style.backgroundImage = "url(" + text[i]['img'] + ")";
            div.style.backgroundSize = "cover";
            div.style.backgroundPosition = "center";
            div.style.backgroundRepeat = "no-repeat";
            div.style.borderRadius = "50%";
            div.style.border = "1px solid black";
            div.style.zIndex = "1";
            div.style.cursor = "pointer";
            div.setAttribute("onclick", "showEditAnimal(" + text[i]['id'] + ")");
            // place the element in the div enclos
            document.getElementsByClassName("enclos-img")[0].appendChild(div);
        }
    });
}

// Fonction qui renvoie true si l'utilisateur est connecté
async function isConnected(){
    const requests = async () => {
        const response = await fetch('/api/session');
        const text = await response.text();
        return(text.length > 0);
    }
    
    return requests();
}

// Fonction qui renvoie true si l'utilisateur est admin
async function isAdmin(){
    const requests = async () => {
        const response = await fetch('/api/admin');
        const text = await response.text();
        return(text == "yes");
    }
    
    return requests();
}

// Fonction qui montre le menu et le main en fonction de l'utilisateur
async function showForConnexion(){
    if(await isConnected()){
        requestHTML('/menu-connected.html', 'navbarHeader', true);
        if(window.location.href.split("#")[1].length < 2){
            requestHTML('/main-connected.html', 'main', true);
        }
        showForAdmin();
    } else {
        requestHTML('/menu.html', 'navbarHeader', true);
        if(window.location.href.split("#")[1].length < 2){
            requestHTML('/main.html', 'main', true);
        }
    }
}

// Fonction qui montre les animaux favoris de l'utilisateur
async function getFavAnimals(){
    const requests = async () => {
        const response = await fetch('/api/animals/favoris');
        const text = await response.text();
        return(text);
    }
    
    return requests();
}

// Fonction qui envoie une requête pour ajouter un animal aux favoris
function addFavAnimal(id){
    requestNoReload('/api/animals/favoris/add/' + id, "answer");
}

// Fonction qui envoie une requête pour retirer un animal des favoris
function removeFavAnimal(id){
    requestNoReload('/api/animals/favoris/delete/' + id, "answer");
}

// Fonction qui envoie une requête pour que l'admin delete un animal
function adminRemoveAnimal(id){
    requestNoReload('/api/animal/delete/' + id, "answer");
    setTimeout(showAnimals,1000);
}


// Fonction qui change le HTML quand l'utilisateur choisis un favoris ou l'enlève
function changeFavoris(id){
    textId = document.getElementById("fav" + id).innerText;
    if(textId == "Retirer des favoris"){
        removeFavAnimal(id);
        document.getElementById("fav" + id).innerHTML = `Ajouter aux favoris`;
        document.getElementById("favicon" + id).innerHTML = `✩`;

    } else {
        addFavAnimal(id);
        document.getElementById("fav" + id).innerHTML = `Retirer des favoris`;
        document.getElementById("favicon" + id).innerHTML = `✭`;
    }
}

// Fonction qui charge le HTML des animaux pour l'utilisateur connecté
async function showAnimalsConnected(){
    if(await isConnected()){
        // Get the user's animals favorites
        ids_fav = await getFavAnimals();
        is_admin = await isAdmin();
        ids_fav = ids_fav.replace("[", "").replace("]", "").split(",");
        console.log(ids_fav)
        fetch('/api/animals').then((e) => e.json()).then((json) => {
            let stringAnimals = '';
            json.forEach(obj => {
              console.log(obj.id.toString);
                if(ids_fav.includes('"' + obj.id.toString() + '"')){
                    favoris = "✭";
                    favname = "Retirer des favoris";
                } else {
                    favoris = "✩";
                    favname = "Ajouter aux favoris";
                }

                // Add buttons for user if admin
                if(is_admin){
                    adminButtons = `<button type="button" class="btn btn-primary" onclick="showEditAnimal(${obj.id})">Éditer</button>
                    <button type="button" class="btn btn-primary" onclick="adminRemoveAnimal(${obj.id})">Supprimer</button>`;
                } else {
                    adminButtons = "";
                }


              stringAnimals += `
                <div class="animal">
                    <div class="card">
                        <center>
                            <div class="img-wrapper">
                                <img src="${obj.img}" alt="${obj.name}" width="100%">
                            </div>
                        </center>
                    </div>
                    <div class="card-body">
                      <p class="card-text"><b><span class="animalName">${obj.name}</span> <span id="favicon${obj.id}" class="fav">${favoris}</span></b> ${obj.descr}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                          <button type="button" class="btn btn-primary" id="fav${obj.id}" onclick="changeFavoris(${obj.id})">${favname}</button>
                          ${adminButtons}
                        </div>
                      </div>
                    </div>
                </div>
                ` 
            });
            document.getElementById("animaux-connected").innerHTML = stringAnimals;
        });
    } else {
        document.getElementById("animaux-connected").innerHTML = "You are not connected...";
    }
}

// Fonction qui ajoute un menu pour l'admin si l'utilisateur est admin
async function showForAdmin(){
    if(await isAdmin()){
        document.getElementById("link-connected").innerHTML = '<li><a href="#addanimal" class="text-white" onclick="showAddAnimal()">Ajouter animal (ADMIN)</a></li>' + document.getElementById("link-connected").innerHTML;
    }
}

// Fonction qui montre les animaux pour la page principale
function showMainAnimals(){
    if(!(window.location.href == window.location.origin + "/#animal")){
        fetch('/api/animals').then((e) => e.json()).then((json) => {
          let stringAnimals = '';
          json.forEach(obj => {
            stringAnimals += `
              <div class="col-md-4">
                <div class="card mb-4 box-shadow">
                  <center>
                  <div class="img-wrapper">
                    <img src="${obj.img}" alt="${obj.name}" width="100%">
                  </div>
                  </center>
                  <div class="card-body">
                    <p class="card-text"><b>${obj.name}</b> ${obj.descr}</p>
                    <div class="d-flex justify-content-between align-items-center">
                    </div>
                  </div>
                </div>
              </div>
              ` 
              document.getElementById("animals").innerHTML = stringAnimals;
          });
      });
    } else {
        document.getElementById("animals").innerHTML = " ";
    }
}

// Fonction de recherche d'animaux
function searchInAnimals() {
    var input, filter, a, i, txtValue, animals, animals2;
    animals = document.getElementById("animaux-connected").getElementsByClassName("animal");
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    for (i = 0; i < animals.length; i++) {
        a = animals[i].getElementsByClassName("animalName")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            animals[i].style.display = "inline-block";
        } else {
            animals[i].style.display = "none";
        }
    }
}

// Fonction qui montre les animaux favoris
function showFavAnimals(){
    var a, i, txtValue, animals;
    animals = document.getElementById("animaux-connected").getElementsByClassName("animal");
    for (i = 0; i < animals.length; i++) {
        a = animals[i].getElementsByClassName("fav")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf("✭") > -1) {
            animals[i].style.display = "inline-block";
        } else {
            animals[i].style.display = "none";
        }
    }
}

// Fonction qui montre tous les animaux (pas que les favoris donc)
function showAllAnimals(){
    var i, animals;
    animals = document.getElementById("animaux-connected").getElementsByClassName("animal");
    for (i = 0; i < animals.length; i++) {
        animals[i].style.display = "inline-block";
    }
}


// Initialisation des fonctions (quand l'utilisateur reload il faut lui montrer ce qu'il recherche (en fonction du # donc))
setMainFromUrl();
showForConnexion();
