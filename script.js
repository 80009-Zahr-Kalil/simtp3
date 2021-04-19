const Distribucion = require("./Distribucion.js");

console.log(Distribucion.uniforme(6, 5, 8));
console.log(Distribucion.exponencial(6, 4));
console.log(Distribucion.normalBoxMuller(5, 5, 1));
console.log(Distribucion.normalConvolucion(6, 12 , 11, 0.3));
console.log(Distribucion.poisson(5, 4));