import * as Distribucion from "./Distribucion.js"


// console.log(Distribucion.uniforme(6, 5, 8));
// console.log(Distribucion.exponencial(6, 4));
// console.log(Distribucion.normalBoxMuller(5, 5, 1));
// console.log(Distribucion.normalConvolucion(6, 12 , 11, 0.3));
// console.log(Distribucion.poisson(5, 4));

// console.log(document.getElementById("input-uniforme").children)


window.distribucionSeleccionada = function distribucionSeleccionada() {
    var elem = document.getElementById("selector");
    cambiarDistribucionActiva(elem.value);
    $("#rellenar").hide();
}


function cambiarDistribucionActiva(id) {
    $(".input").hide();
    $("#"+id).show();
    var list = document.getElementsByClassName("textbox");
    for (var item of list) {
        item.classList.remove("activo");
    }
    var elem = document.getElementById(id);
    var list =elem.getElementsByClassName("textbox");
    for (var item of list) {
        item.classList.add("activo");
    }
}

function obtenerInputs() {
    var inputs = document.getElementsByClassName("textbox activo");
    var res = [];
    for (var item of inputs) {
        res.push(item.value);
    }
    return res;
}


window.mostrarOutput = function mostrarOutput() { // Cuando cambio de distribucion quiero que desaparezca la tabla anterior y genere una nueva
    // generar();
    rellenarTabla();
    mostrarGrafico();
}


function generar() {
    var inputs = obtenerInputs();
    var outputs = []
    for(var i=0; i<inputs.length; i++) {
        inputs[i] = Number(inputs[i]);
    }
    var distribucionSeleccionada = document.getElementById("selector").value;
    if(distribucionSeleccionada == "input-uniforme") {
        outputs = Distribucion.uniforme(inputs);
    }
    if(distribucionSeleccionada == "input-exponencial") {
        outputs = Distribucion.exponencial(inputs);
    }
    if(distribucionSeleccionada == "input-normalBoxMuller") {
        outputs = Distribucion.normalBoxMuller(inputs);
    }
    if(distribucionSeleccionada == "input-normalConvolucion") {
        outputs = Distribucion.normalConvolucion(inputs);
    }
    if(distribucionSeleccionada == "input-poisson") {
        outputs = Distribucion.poisson(inputs);
    }
    return outputs;
}


function rellenarTabla() {
    var cadena = "<tr class='titulo-tabla'><th>i</th><th>número</th></tr>";
    var outputs = generar();
    for(var i=0; i<outputs.length; i++) {
        cadena += "<tr><td>" + (i+1) + "</td><td>" + outputs[i] + "</td></tr>"
    }
    $("#rellenar").html(cadena);
    $("#rellenar").show();
}


function mostrarGrafico() {

}