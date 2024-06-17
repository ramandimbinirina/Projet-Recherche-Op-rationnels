function Moteur(nb_sommet, is_min){
	var init_sommet = is_min ? Infinity : -Infinity;
	this.n = nb_sommet;
	this.liste_sommet = new Array();
	for (var i = 0; i < n; i++) {
		this.liste_sommet.push(new Sommet(i+1,init_sommet));
	}
	this.liste_sommet[n-1].coutTotal = 0;
}

// // Fonction pour définir un sommet
// function Sommet(nom, coutTotal) {
//     this.nom = nom; // Le nom est maintenant une lettre
//     this.coutTotal = coutTotal;
// }


// function Moteur(nb_sommet, is_min){
//     var init_sommet = is_min ? Infinity : -Infinity;
//     this.n = nb_sommet;
//     this.liste_sommet = new Array();
//     // Fonction pour convertir un nombre en lettre
//     function convertirEnLettre(n) {
//         return String.fromCharCode(97 + n).toUpperCase(); // A=0, B=1, ...
//     }
//     // Demander à l'utilisateur d'entrer les sommets
//     for (var i = 0; i < this.n; i++) {
//         var sommet;
//         // Tant que l'entrée n'est pas valide, continuer de demander
//         do {
//             sommet = prompt("Entrez le sommet " + (i + 1) + " (une seule lettre)").toUpperCase();
//         } while (!/^[A-Z]$/.test(sommet)); // S'assurer que l'entrée est une seule lettre majuscule
//         this.liste_sommet.push(new Sommet(convertirEnLettre(i), init_sommet));
//     }
//     this.liste_sommet[this.n - 1].coutTotal = 0;
// }


// // Exemple d'utilisation :
// var nb_sommet = parseInt(prompt("Entrez le nombre de sommets :"));
// var is_min = true; // true si le sommet est minimum, sinon false
// var moteur = new Moteur(nb_sommet, is_min);
// console.log(moteur.liste_sommet);


