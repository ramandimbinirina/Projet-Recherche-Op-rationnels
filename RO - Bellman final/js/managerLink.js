function ViewManager(scene, moteur) {
	this.scene = scene;
	this.moteur = moteur;
	this.currentObject = null;
	this.mode = "item";
	this.initialColors = {};
}

ViewManager.prototype = {

	getSommet : function(position) {
		for(item of this.scene.items)
			if(item instanceof Sommet)
				if((new Line(item.position, position)).length() <= item.rayon)
					return item;

		return null;
	},

	getLien : function(position) {
		for(item of this.scene.items)
			if(item instanceof Lien) {
				if((new Line(item.precedent.position, position).length()
				+ new Line(item.suivant.position, position).length()) / 
				  new Line(item.precedent.position, item.suivant.position).length() < 1.0014 /* marge = 0.0014 */)
					return item;
			}
		return null;
	},

	getItem : function(position) {
		return this.getLien(position) || this.getSommet(position);
	},

	deleteItem : function(position) {
		var item = this.getItem(position);
		if(item != null) {
			this.scene.removeItem(item);
			if(item instanceof Sommet) {
				var liens = this.moteur.supprimerSommet(item);
				if(liens != null) {
					for(var lien of liens) {
						this.scene.removeItem(lien);
					}
				}
			}
			else if(item instanceof Lien) 
				this.moteur.supprimerLien(item);
			this.scene.clear();
			this.scene.paint();
		}
	},

	

	onMouseDown : function(position) {
			switch(this.mode) {
			case "drag":
				var item = this.getSommet(position);
				if(item != null) {
						this.currentObject = {
							item : item,
							offsetX : position.x - item.position.x,
							offsetY : position.y - item.position.y
						};
				}
				break;
			case "item":
				var item = this.getSommet(position);
				if(item != null) {
					var sommet = new Sommet(0, 0);
					var lien = new Lien("", item, sommet);
					this.currentObject = {
						item : sommet,
						link : lien,
						offsetX : 0,
						offsetY : 0
					};
					this.scene.addItem(lien);
				}
				break;
			}
	},

	onMouseMove : function(position) {
		switch(this.mode) {
			case "item":
			case "drag":
				if(this.currentObject != null) {
					this.currentObject.item.position = {
						x : position.x - this.currentObject.offsetX,
						y : position.y - this.currentObject.offsetY
					};
					this.scene.clear();
					this.scene.paint();
				}
				break;
		}
	},

	onMouseUp : function(position) {
		switch(this.mode) {
			case "drag":
				this.currentObject = null;
				break;
			case "item":
				if(this.currentObject != null) {
					var item = this.getSommet(position), cout;
					if(item != null && item != this.currentObject.link.precedent && !isNaN(cout = parseInt(prompt("Saisisez le cout du chemin")))) {
						this.currentObject.link.cout = cout;
						this.currentObject.link.suivant = item;
						this.moteur.ajouterLien(this.currentObject.link);
						console.log(cout);
					} else this.scene.removeItem(this.currentObject.link);
					this.currentObject = null;
					this.scene.clear();
					this.scene.paint();
				} else {
					var sommet = this.moteur.ajouterSommet();
					sommet.position = {
						x : position.x,
						y : position.y
					};
					this.scene.addItem(sommet);
					console.log(sommet);
					this.scene.clear();
					this.scene.paint();
				}
				break;
		}
	},

	onClick : function(position) {
		switch(this.mode) {
			case "delete":
				this.deleteItem(position);
				break;
                        case "debut":
                            this.moteur.setDebut(this.getSommet(position));
                            this.refresh();
                        break;
                        case "fin":
                            this.moteur.setFin(this.getSommet(position));
                            this.refresh();
                        break;
		}
	},

	onDblClick : function(position) {
		switch(this.mode) {
		case "update":
			var lien = this.getLien(position);
			if(lien != null) {
				var cout = parseInt(prompt("Saisisez le cout du chemin"));
				if(!isNaN(cout)) {
					lien.cout = cout;
					this.scene.clear();
					this.scene.paint();
				}
			}
		break;
		}
	},
        
        refresh : function (){
            this.scene.clear();
            this.scene.paint();
        },
	
		reset: function () {
			// // Réinitialiser les coûts et vider les résultats
			// this.initialiserCoutsTotaux();
			// this.scene.clear();
			// this.scene.paint();
			// // Clear the trace table
			// var traceTable = document.getElementById("tableTrace");
			// traceTable.innerHTML = '<tr><th>Index Précédent</th><th>Index à traiter</th><th>Valeur Arc</th><th>Coût Total</th></tr>';
			var tableTrace = document.getElementById("tableTrace");
		tableTrace.getElementsByTagName('tbody')[0].innerHTML = '';
		this.moteur.initialiserCoutsTotaux();
		this.scene.items.forEach(item => {
			item.color =  "rgb(3, 4, 72)"; // Couleur par défaut
		});
		for (let item of this.scene.items) {
			if (!this.initialColors[item.type]) {
				this.initialColors[item.type] = [];
			}
			this.initialColors[item.type].push(item);
		}
		this.refresh();
		},
        
}
