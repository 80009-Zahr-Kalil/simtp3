// Distribucion Uniforme
exports.uniforme = (cantidad, desde, hasta) => {
    var listaNumeros = [];
    for(var i=0; i<cantidad ; i++){
        var rnd = Math.random();
        var res = desde + rnd * (hasta-desde);
        listaNumeros.push(Number(res.toFixed(2)));
    }
    // console.log(listaNumeros);
    return listaNumeros; 
}
// console.log("UNIFORME ", uniforme(6, 5, 8));


// Distribucion Exponencial
exports.exponencial = (cantidad, lambda) => {
    listaNumeros = [];
    for(var i=0; i<cantidad; i++) {
        var rnd = Math.random();
        var res = ((-1)/lambda) * Math.log(1-rnd)
        listaNumeros.push(Number(res.toFixed(2)));
    }
    return listaNumeros;
}
// console.log("EXPONENCIAL ", exponencial(6, 4));


// Distribucion Normal Box-Muller
exports.normalBoxMuller = (cantidad, media, desviacion) => {
    var listaNumeros = [];
    for(var i=0; i<cantidad ; i++){
        var rnd1 = Math.random().toFixed(2);
        var rnd2 = Math.random().toFixed(2);
        if(i%2==1){
            var res1 = ((Math.sqrt((-2) * Math.log(rnd1))) * (Math.cos(2*Math.PI*rnd2))) * desviacion + media;
            listaNumeros.push(Number(res1.toFixed(2)));
        }
        if(i%2==0){
            var res2 = ((Math.sqrt((-2) * Math.log(rnd1))) * (Math.sin(2*Math.PI*rnd2))) * desviacion + media;
            listaNumeros.push(Number(res2.toFixed(2)));
        }
    }
    // console.log(listaNumeros);
    return listaNumeros; 
}
// console.log("BOX-MULLER ", normalBoxMuller(5, 5, 1));


// Distribucion Normal con Convolucion 
exports.normalConvolucion = (cantidad, cantidadRnd, media, desviacion) => {
    var listaNumeros = [];
    var sumaRnd = 0;
    for(i=0; i<cantidad ; i++){
        for(var j=0; j<cantidadRnd ; j++){
            sumaRnd += Math.random();
        }
        var res = ((sumaRnd-(cantidadRnd/2)) / Math.sqrt(cantidadRnd/12)) * desviacion + media;
        listaNumeros.push(Number(res.toFixed(2)));
    }
    // console.log(listaNumeros);
    return listaNumeros;
}
// console.log("CONVOLUCION ", normalConvolucion(6, 12 , 11, 0.3));


// Distribucion Poisson
exports.poisson = (cantidad, media) => {
    var listaNumeros = [];
    for(var i=0; i<cantidad; i++) {
        var p = 1;
        var res = -1;
        var a = Math.exp(-media);
        var rnd = Math.random();
        p *= rnd;
        res += 1;
        while(p >= a) {
            rnd = Math.random();
            p *= rnd;
            res += 1;
        }
        listaNumeros.push(res);
    }
    return listaNumeros;
}
// console.log("POISSON ", Poisson(6, 2));




// module.exports = { uniforme, exponencial, normalBoxMuller, normalConvolucion, poisson };