function Ordonancement(content){
    this.content = content;
    this.liste   = new Array();
    this.sommets = this.getListeSommets();
    this.table   = this.getTableau();
}

Ordonancement.prototype = {
    main : function () {
        
    },
    
    getTableau : function () {
        var n       = this.content.sommets.length;
        var tableau = new Array(n + 1);
        for (var i = 0 ; i < n ; i++){
            tableau[i] = new Array(n);
        }
        for (var i = 0 ; i < n ; i++){
            var e = this.content.getPrecedents(this.sommets[i]);
            var a = new Array();
            for(var l in e){
                a.push(l.precedent);
            
            for(var j = 0 ; j < n ; j++){
                if(a.indexOf(this.sommets[j]) >= 0){
                    tableau[i][j] = 1;
                }
                else {
                    tableau[i][j] = 0;
                }
            }
            }
        }
        return tableau;
    },
    
    getListeSommets : function () {
        var i       = 0;
        var tableau = new Array();
        for (var s in this.content.sommets){
            tableau[i] = s;
            i++;
        }
        return tableau;
    },
    
    calul : function (){
        
    },
    
    sommeColonne : function (i) {
        var n = this.sommets.length;
        var s = 0;
        for (var j = 0 ; j < n ; j++){
            s = this
        }
    }
    
}