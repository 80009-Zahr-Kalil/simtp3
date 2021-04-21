// Distribucion Uniforme
export function uniforme (arr) { // [cantidad, desde, hasta]
    var listaNumeros = [];
    for(var i=0; i<arr[0] ; i++){
        var rnd = Math.random();
        var res = arr[1] + rnd * (arr[2]-arr[1]);
        listaNumeros.push(Number(res.toFixed(2)));
    }
    console.log(listaNumeros);
    return listaNumeros; 
}
// console.log("UNIFORME ", uniforme([5,2,6]));


// Distribucion Exponencial
export function exponencial (arr) { // [cantidad, lambda]
    var listaNumeros = [];
    for(var i=0; i<arr[0]; i++) {
        var rnd = Math.random();
        var res = ((-1)/arr[1]) * Math.log(1-rnd)
        listaNumeros.push(Number(res.toFixed(2)));
    }
    console.log(listaNumeros);
    return listaNumeros;
}
// console.log("EXPONENCIAL ", exponencial(6, 4));


// Distribucion Normal Box-Muller
export function normalBoxMuller (arr) { // [cantidad, media, desviacion]
    var listaNumeros = [];
    for(var i=0; i<arr[0] ; i++){
        var rnd1 = Math.random().toFixed(2);
        var rnd2 = Math.random().toFixed(2);
        if(i%2==1){
            var res1 = ((Math.sqrt((-2) * Math.log(rnd1))) * (Math.cos(2*Math.PI*rnd2))) * arr[2] + arr[1];
            listaNumeros.push(Number(res1.toFixed(2)));
        }
        if(i%2==0){
            var res2 = ((Math.sqrt((-2) * Math.log(rnd1))) * (Math.sin(2*Math.PI*rnd2))) * arr[2] + arr[1];
            listaNumeros.push(Number(res2.toFixed(2)));
        }
    }
    console.log(listaNumeros);
    return listaNumeros; 
}
// console.log("BOX-MULLER ", normalBoxMuller(5, 5, 1));


// Distribucion Normal con Convolucion 
export function normalConvolucion (arr) { // [cantidad, cantidadRnd, media, desviacion]
    var listaNumeros = [];
    for(var i=0; i<arr[0] ; i++){
        var sumaRnd = 0;
        for(var j=0; j<arr[1] ; j++){
            sumaRnd += Math.random();
        }
        var res = ((sumaRnd-(arr[1]/2)) / Math.sqrt(arr[1]/12)) * arr[3] + arr[2];
        listaNumeros.push(Number(res.toFixed(2)));
    }
    console.log(listaNumeros);
    return listaNumeros;
}
//console.log("CONVOLUCION ", normalConvolucion([6, 12 , 11, 0.3]));


// Distribucion Poisson
export function poisson (arr) {  // [cantidad, media]
    var listaNumeros = [];
    for(var i=0; i<arr[0]; i++) {
        var p = 1;
        var res = -1;
        var a = Math.exp(-arr[1]);
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
    console.log(listaNumeros);
    return listaNumeros;
}
// console.log("POISSON ", Poisson(6, 2));



