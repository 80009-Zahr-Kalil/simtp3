import * as Distribucion from "./Distribucion.js"


window.distribucionSeleccionada = function distribucionSeleccionada() {
    var elem = document.getElementById("selector");
    cambiarDistribucionActiva(elem.value);
    $("#rellenar").hide();
    $("#chartdiv").hide();
}


function cambiarDistribucionActiva(id) {
    $(".input").hide();
    $("#estadistico").hide();
    $("#hipotesisNula").hide();
    $("#tablaFrecuencias").hide();
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

function obtenerInputs(sacarIntervalo) {
    var inputs = document.getElementsByClassName("textbox activo");
    var res = [];
    for (var item of inputs) {
        res.push(Number(item.value));
    }
    if(sacarIntervalo) {
        res.splice(-1,1);
    }
    return res;
}

function obtenerIntervalos(subintervalos, min, max) {
    var amplitud = ((max-min) / subintervalos) + 0.0001;
    var listaIntervalos = [];
    for(var i=0; i<subintervalos; i++) {
        var inicio = min + amplitud * i;
        var cierre = min + amplitud * (i+1);
        listaIntervalos.push([inicio, cierre]);
    }
    return listaIntervalos;
}

function obtenerInputIntervalo() {
    var cantidadIntervalos = document.getElementsByClassName("textbox intervalos activo")[0];
    return cantidadIntervalos ? cantidadIntervalos.value : -1;
}

function frecuencia(listaNumeros, listaIntervalos) {
    var frecuencias = [];
    for(var i=0; i<listaIntervalos.length; i++) {
        frecuencias.push(0);
    }
    for(var i=0; i<listaNumeros.length; i++) {
        for(var j=0; j<listaIntervalos.length; j++) {
            if(listaNumeros[i] >= listaIntervalos[j][0] && listaNumeros[i] < listaIntervalos[j][1]) {
                frecuencias[j]++;
                break;
            }
        }
    }
    return frecuencias;
}


function frecuenciaPoisson(outputs) {
    var max = Math.max(...outputs);
    var min = Math.min(...outputs);
    var frecuenciasObservadas = new Array(max-min+1).fill(0);
    for(var i=0; i<outputs.length; i++) {
        frecuenciasObservadas[(outputs[i]-min)]++;
    }
    return frecuenciasObservadas;
}


function calcularChiCuadrado(subintervalos, frecuenciasObservadas) {
    var sumatoriaFrecuenciasObservadas = frecuenciasObservadas.reduce(function(a, b) {return a+b});
    var frecuenciaEsperada = sumatoriaFrecuenciasObservadas / subintervalos;
    var estadistico = 0;
    for(var i=0; i<frecuenciasObservadas.length; i++) {
        var n1 = (frecuenciasObservadas[i] - frecuenciaEsperada)**2;
        var n2 = n1 / frecuenciaEsperada;
        estadistico += n2;
    }
    return estadistico;
}


window.mostrarOutput = function mostrarOutput() { 
    var cantidadIntervalos = obtenerInputIntervalo();
    var outputs = generar();
    var min = Math.min(...outputs);
    var max = Math.max(...outputs);
    var listaIntervalos = obtenerIntervalos(cantidadIntervalos, min, max);
    var frecuenciasObservadas = cantidadIntervalos!=-1 ? frecuencia(outputs, listaIntervalos) : frecuenciaPoisson(outputs);
    rellenarTabla(outputs);

    var media = outputs.reduce(function(a, b) {return a+b}) / outputs.length;
    var desviacion = Math.sqrt(varianza(outputs));
    var lambda = 1/media;

    var probabilidades = calcularProbabilidades(listaIntervalos, frecuenciasObservadas, media, desviacion, lambda);

    var frecuenciasEsperadas = calcularFrecuenciaEsperada(probabilidades, outputs.length);

    var tablaFrecuenciasConvertida = conversionTablaFrecuencias(listaIntervalos, frecuenciasObservadas, frecuenciasEsperadas, probabilidades);
    renellarTablaFrecuencias(tablaFrecuenciasConvertida[0], tablaFrecuenciasConvertida[1], tablaFrecuenciasConvertida[2], tablaFrecuenciasConvertida[3]);

    var estadistico = calcularChiCuadrado(cantidadIntervalos, outputs);
    $("#estadistico").html("ESTADÍSTICO: " + Number(estadistico.toFixed(4)));
    $("#estadistico").show();
    $("#hipotesisNula").html("Se rechaza la hipótesis nula de que el generador genera números pseudo aleatorios con la distribución seleccionada.");
    $("#hipotesisNula").show();

    var intervalosString = [];
    for(var i=0; i<listaIntervalos.length; i++) {
        intervalosString.push(listaIntervalos[i][0].toFixed(2).toString() + "-" + listaIntervalos[i][1].toFixed(2).toString());
    }
    mostrarGrafico(intervalosString, frecuenciasObservadas, outputs);
}


function generar() {
    var distribucionSeleccionada = document.getElementById("selector").value;
    var inputs = obtenerInputs(distribucionSeleccionada != "input-poisson");
    var outputs = [];
    for(var i=0; i<inputs.length; i++) {
        inputs[i] = Number(inputs[i]);
    }
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


function rellenarTabla(outputs) {
    var cadena = "<tr class='titulo-tabla'><th>i</th><th>número</th></tr>";
    for(var i=0; i<outputs.length; i++) {
        cadena += "<tr><td>" + (i+1) + "</td><td>" + outputs[i] + "</td></tr>"
    }
    $("#rellenar").html(cadena);
    $("#rellenar").show();
}


function renellarTablaFrecuencias(listaIntervalos, frecuenciasObservadas, frecuenciasEsperadas, probabilidades) {
    var cadena = "<tr class='titulo-tabla'><th>Intérvalos</th><th>FO</th><th>FE</th><th>P()</th></tr>";
    for(var i=0; i<listaIntervalos.length; i++) {
        cadena += "<tr><td>" + listaIntervalos[i] + "</td><td>" + frecuenciasObservadas[i] + "</td><td>" + frecuenciasEsperadas[i] + "</td><td>" + probabilidades[i] + "</td></tr>"
    }
    $("#tablaFrecuencias").html(cadena);
    $("#tablaFrecuencias").show();
}

function conversionTablaFrecuencias(listaIntervalos, frecuenciasObservadas, frecuenciasEsperadas, probabilidades) {
    var intervalosFinales = [];
    var foFinales = [];
    var feFinales = [];
    var probFinales = [];

    for(var i=0; i<listaIntervalos.length; i++) {
        var str1 = listaIntervalos[i][0].toFixed(2) + " - " + listaIntervalos[i][1].toFixed(2);
        intervalosFinales.push(str1);

        var str2 = frecuenciasObservadas[i].toString();
        foFinales.push(str2);

        var str3 = frecuenciasEsperadas[i].toFixed(4);
        feFinales.push(str3);

        var str4 = probabilidades[i].toFixed(4);
        probFinales.push(str4);
    }

    return [intervalosFinales, foFinales, feFinales, probFinales];
}


function calcularProbabilidades(listaIntervalos, frecuenciasObservadas, media, desviacion, lambda) {
    var distribucionSeleccionada = document.getElementById("selector").value;
    var probabilidades = [];
    if(distribucionSeleccionada == "input-uniforme") {
        for(var i=0; i<listaIntervalos.length; i++) {
            var prob = Distribucion.probUniforme(listaIntervalos[i][0], listaIntervalos[i][1]);
            probabilidades.push(prob);
        }
    }
    if(distribucionSeleccionada == "input-exponencial") {
        for(var i=0; i<listaIntervalos.length; i++) {
            var prob = Distribucion.probExponencial(lambda, frecuenciasObservadas[i], listaIntervalos[i][0], listaIntervalos[i][1]);
            probabilidades.push(prob);
        }
    }
    if(distribucionSeleccionada == "input-normalBoxMuller") {
        for(var i=0; i<listaIntervalos.length; i++) {
            var prob = Distribucion.probNormal(media, desviacion, frecuenciasObservadas[i], listaIntervalos[i][0], listaIntervalos[i][1]);
            probabilidades.push(prob);
        }
    }
    if(distribucionSeleccionada == "input-normalConvolucion") {
        for(var i=0; i<listaIntervalos.length; i++) {
            var prob = Distribucion.probNormal(media, desviacion, frecuenciasObservadas[i], listaIntervalos[i][0], listaIntervalos[i][1]);
            probabilidades.push(prob);
        }
    }
    if(distribucionSeleccionada == "input-poisson") {
        for(var i=0; i<frecuenciasObservadas.length; i++) {
            var prob = Distribucion.probPoisson(lambda, frecuenciasObservadas[i]);
            probabilidades.push(prob);
        }
    }
    return probabilidades;
}

function calcularFrecuenciaEsperada(probabilidades, cantidadRegistros) {
    var frecuenciasEsperadas = [];
    for(var i=0; i<probabilidades.length; i++) {
        frecuenciasEsperadas.push(probabilidades[i] * cantidadRegistros);
    }
    return frecuenciasEsperadas;
}

function varianza(arr) {
    var acum = 0;
    for(var i=0; i<arr.length; i++) {
        acum += arr[i]**2;
    }
    var res = acum / (arr.length-1);
    return res;
}


function mostrarGrafico(listaIntervalos, frecuenciasObservadas, outputs) {
    am4core.ready(function() {

        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create('chartdiv', am4charts.XYChart)
        chart.colors.step = 2;
        
        chart.legend = new am4charts.Legend()
        chart.legend.position = 'top'
        chart.legend.paddingBottom = 20
        chart.legend.labels.template.maxWidth = 95
        
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        
        function createSeries(value, name) {
            var series = chart.series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
        
            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);
        
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
        
            return series;
        }
        
        chart.data = [
            {
                category: "",
                first: 0
            }
        ]

        if(listaIntervalos.length > 0) {
            for(var i=0; i<listaIntervalos.length; i++) {
                chart.data[i] = {
                    category: listaIntervalos[i],
                    first: frecuenciasObservadas[i]
                }
            }
        } else {
            var min = Math.min(...outputs);
            for(var i=0; i<frecuenciasObservadas.length; i++) {
                chart.data[i] = {
                    category: i+min, 
                    first: frecuenciasObservadas[i]
                }
            }
        }
        
        
        createSeries('first', 'Frecuencias Observadas');
        
        function arrangeColumns() {
        
            var series = chart.series.getIndex(0);
        
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart.series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart.series.length / 2;
        
                    var newIndex = 0;
                    chart.series.each(function(series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart.series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
        
                    chart.series.each(function(series) {
                        var trueIndex = chart.series.indexOf(series);
                        var newIndex = series.dummyData;
        
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
        
                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
        }
        
        }); // end am4core.ready()
        $("#chartdiv").show();
}