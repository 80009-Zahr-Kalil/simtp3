import * as Distribucion from "./Distribucion.js"


window.distribucionSeleccionada = function distribucionSeleccionada() {
    var elem = document.getElementById("selector");
    cambiarDistribucionActiva(elem.value);
    $("#rellenar").hide();
    $("#chartdiv").hide();
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


window.mostrarOutput = function mostrarOutput() { 
    var inputs = obtenerInputs();
    var cantidadIntervalos = obtenerInputIntervalo();
    var outputs = generar();
    var min = Math.min(...outputs);
    var max = Math.max(...outputs);
    var listaIntervalos = obtenerIntervalos(cantidadIntervalos, min, max);
    var frecuenciasObservadas = cantidadIntervalos!=-1 ? frecuencia(outputs, listaIntervalos) : frecuenciaPoisson(outputs);
    rellenarTabla(outputs);
    var intervalosString = [];
    for(var i=0; i<listaIntervalos.length; i++) {
        intervalosString.push(listaIntervalos[i][0].toFixed(2).toString() + "-" + listaIntervalos[i][1].toFixed(2).toString());
    }
    mostrarGrafico(intervalosString, frecuenciasObservadas, outputs);
}


function generar() {
    var distribucionSeleccionada = document.getElementById("selector").value;
    var inputs = obtenerInputs(distribucionSeleccionada != "input-poisson");
    var outputs = []
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