  var servicios = require('./interoperabilidad/servicios_web');
  var nits = require('./data/nits2');
  var models = require('./models');
  var util = require('./util/util');

  // var nit = '295671015';
models.empresa.findAll()
.then(function (params) {
  console.log("params", params)
})
.catch(function (params) {
  console.log("errr", params)
})



util.iterarArray(nits, function (nit, callbackContinuar, callbackError) {


  servicios.obtenerMatriculas(nit)
    .then(function (resp) {
      console.log(resp);
      callbackContinuar()
    })
    .catch(function (respErr) {
      console.log(respErr);
      callbackContinuar()
    })
})
.then(function (res) {
  console.log("TERMINADO")
})
.catch(function (resErr) {
  console.log("err ", resErr)
})


