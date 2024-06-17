function ConteneurLiens() {
	//this.infinity       = isMin ? Infinity : -Infinity;
	//this.compare        = isMin ? "<" : ">";
	this.liens          = new Array();
	this.sommets        = new Array();
	this.debut          = null;
	this.fin            = null;
        this.visited        = new Array();
        //this.isMin          = isMin;
        this.solution       = false;
        this.infinite       = false;
        this.infiniteList   = new Array();
        this.traces         = new Array();
        //this.traceLevel     = 1;
        this.lastIndex      = 1;
}

ConteneurLiens.prototype = {

	ajouterLien : function(lien) {
		this.liens.push(lien);
	},

        supprimerLien : function(lien) {
		var index = this.liens.indexOf(lien);
		if(index >= 0) {
			this.liens.splice(index, 1);
			return true;
		}

		return false;
	},
        
        supprimerSommet : function(sommet) {
		var index = this.sommets.indexOf(sommet);
		if(index >= 0) {
			var liens = this.getPrecedents(sommet).concat(this.getSuivants(sommet));
			for(lien of liens)
				this.liens.splice(this.liens.indexOf(lien), 1);
			this.sommets.splice(index, 1);
			return liens;
		}

		return null;
	},
        
	getPrecedents : function(sommet) {
		var result = new Array();

		for(var lien of this.liens)
			if(lien.suivant == sommet)
				result.push(lien);

		return result;
	},

	getSuivants : function(sommet) {
		var result = new Array();

		for(var lien of this.liens)
			if(lien.precedent == sommet)
				result.push(lien);

		return result;
	},

	ajouterSommet : function() {
		var sommet = new Sommet(this.lastIndex, Infinity);
		this.sommets.push(sommet);
                //alert(sommet.index + " - " + sommet.coutTotal);
                this.lastIndex++;
		return sommet;
        // var nb_sommet = parseInt(prompt("Entrez le nombre de sommets :"));
        // var is_min = true; // true si le sommet est minimum, sinon false
        // var moteur = new Moteur(nb_sommet, is_min);
        // console.log(moteur.liste_sommet);      
	},
    

        initialiserCoutsTotaux : function() {
		for(var sommet of this.sommets)
			sommet.coutTotal = this.isMin ? Infinity : -Infinity;
	},

	getSommetByIndex : function(index) {
		for(var sommet of this.sommets)
			if(sommet.index === index)
				return sommet;

		return null;
	},

	setDebut : function(index) {
		this.debut = this.getSommetByIndex(index.index);
                this.resetColor();
                return this.debut;
	},

	setFin : function(index) {
                this.fin = this.getSommetByIndex(index.index);
                this.resetColor();
                return this.fin;
	},

	// main : function() {
    //             this.initialiserCoutsTotaux();
	// 	if(this.debut != null && this.fin != null) {
    //                     this.fin.coutTotal = 0;
    //                     this.ajouterTrace(this.fin,0);
    //                     var l = new Array();
    //                     l.push(this.fin);
	// 		this.traiter(l);
    //                     this.colorResult();
    //                     if(this.infinite)
    //                         this.colorInfinite();
    //                     return true;
	// 	}
    //             else
    //                 return false;
	// },

    // Fonction spécifique à la recherche de maximum
mainMax: function() {
    this.initialiserCoutsTotaux();
    if(this.debut != null && this.fin != null) {
        this.fin.coutTotal = 0;
        this.ajouterTrace(this.fin,0);
        var l = new Array();
        l.push(this.fin);
        this.traiter(l);
        this.colorResult();
        if(this.infinite)
            this.colorInfinite();
        return true;
    }
    else
        return false;
},

// Fonction spécifique à la recherche de minimum
mainMin: function() {
    this.initialiserCoutsTotaux();
    if(this.debut != null && this.fin != null) {
        this.fin.coutTotal = 0;
        this.ajouterTrace(this.fin,0);
        var l = new Array();
        l.push(this.fin);
        this.traiter(l);
        this.colorResult();
        if(this.infinite)
            this.colorInfinite();
        return true;
    }
    else
        return false;
},
	traiter : function(l_aTraiter) {
            var _l = l_aTraiter;
            var l = new Array();
            var trouve=false;
            // var k=1;
            while(_l.length > 0){
                for(var e of _l){
                    var l_p = this.getPrecedents(e);
                    for(var lien of l_p){
                        if(!this.getInfiniteLoop(e,lien.precedent)){
                            var precedent = lien.precedent;
                            var aTraiter = e;
                            // k++;
                            if(eval((aTraiter.coutTotal + lien.cout) + this.compare + precedent.coutTotal)){
                                precedent.coutTotal = aTraiter.coutTotal + lien.cout;
                                precedent.suivant = aTraiter;
                                this.ajouterTrace(precedent,precedent.coutTotal, lien);
                                this.appendRow({
                                    
                                    precedentIndex: precedent.index,
                                    aTraiterIndex: aTraiter.index,
                                    valeurArc: lien.cout,                                    
                                    coutTotale: `v${Math.abs(aTraiter.index)}=V(${Math.abs(precedent.index)},${Math.abs(aTraiter.index)})+V(${Math.abs(aTraiter.index)})`,
                                    coutTotal: precedent.coutTotal,
                                })
                                if(precedent != this.debut)
                                    l.push(precedent);
                                else
                                    this.solution=true;
                            }
                        }
                        else{
                            //alert("boucle infinie" + lien.precedent.index + "->" + lien.suivant.index);
                            this.infinite=true;
                        }
                    }
                }
                this.clearArray(_l);
                this.copyArray(l,_l);
                this.clearArray(l);
            }
            //return trouve;
	},
    
    appendRow : function(object){
        var row = document.createElement("tr");
        for (var e in object){
            var td = document.createElement("td");
            td.innerHTML=object[e];
            row.appendChild(td);
        }
        document.getElementById("tableTrace").lastElementChild.appendChild(row);
    },
        
        copyArray : function(i,o){
            for(var e of i){
                o.push(e);
            }
            return o;
        },
        
        clearArray : function(a){
            while(a.length > 0)
                a.pop();
            return a;
        },
        
        getInfiniteLoop: function(actual,toFind){
            var a = actual;
            var t = false;
            var l = new Array();
            while(t == false && a!=null){
                if(a.index == toFind.index)
                    t = true;
                l.push(a);
                a = a.suivant;
            }
            if(t==true){
                this.infiniteList.push(l);
            }
            return t;
        },
        
        getTitle : function(){
            var text = this.isMin ? "Minimisation" : "Maximisation";
            return text;
        },
        
        setIsMin : function(isMin){
            this.isMin = isMin;
            this.infinity       = isMin ? Infinity : -Infinity;
            this.compare        = isMin ? "<" : ">";
        },
        
        setIsMax: function(isMax){
            this.isMax = isMax;
            this.infinity = isMax ? -Infinity : Infinity;
            this.compare = isMax ? ">" : "<";
        },
        setView : function (view){
            this.view = view;
        },
        
        resetColor : function (){
            for(var s in this.sommets){
                s.color = {r : 255, g : 255 , b : 0};
            }
        if(this.debut!=null)
            this.debut.color = {
                    r : 0,
                    g : 255,
                    b : 0
            };
        
        if(this.fin!=null)    
            this.fin.color = {
                    r : 0,
                    g : 0,
                    b : 255
            };
        },
        
        colorResult : function(){
            if(this.solution == true){
                this.initialiserCoutsTotaux();
                this.animationCout(0);
                
            }
            else
            {
                alert("Aucune solution possible trouvé");
            }
        },
        
        ajouterTrace : function(sommet, cout, lien) {
		this.traces.push({
			sommet : sommet,
			cout   : cout,
            lien   : lien
		});
	},

	getTraces : function() {
		this.traces.sort(function(a, b) {
			return a.niveau > b.niveau;
		});

		return this.traces;
	},
        
        animationColor : function (s){
            if(s != null){
            s.color = {
		r : 255,
		g : 0,
		b : 0
            };
            this.view.refresh();
            var ts = this;
            setTimeout(function (){
                ts.animationColor(s.suivant);
            },1000);}
        else
        {
            this.colorInfinite();
        }
        },
        
        animationCout : function (i){
            if(i<this.traces.length){
            this.traces[i].sommet.coutTotal = this.traces[i].cout;
            if(this.traces[i].lien != null)
                this.traces[i].lien.actualtrace = true;
            this.view.refresh();
            if(this.traces[i].lien != null)
                this.traces[i].lien.actualtrace = false;
            var ts = this;
            setTimeout(function (){
                ts.animationCout(i+1);
            },1000);}
        else{
            this.animationColor(this.debut);
        }
        },
        
        colorInfinite : function (){
            for(var i of this.infiniteList){
                for(var s of i){
                    s.color={
                        r : 255,
                        g : 0,
                        b : 0
                    };
                }
            }
            alert('Voici la solution');
            this.view.refresh();
        },

        viderChemin: function() {
            // Efface le chemin et les résultats
            this.clearArray(this.chemin);
            this.clearArray(this.traces);
            this.clearTable();
            this.solution = false;
            this.infinite = false;
        },
        
        viderResultat: function() {
            // Efface uniquement les résultats
            this.clearArray(this.traces);
            this.clearTable();
            this.solution = false;
            this.infinite = false;
        },
        clearTable: function() {
            // Efface le tableau
            var table = document.getElementById("table-resultat");
            while(table.rows.length > 1) {
                table.deleteRow(1);
            }
        },
}