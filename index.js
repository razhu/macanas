  var servicios = require('./interoperabilidad/servicios_web');
  var nits = require('./data/nits2');
  var models = require('./models');
  var util = require('./util/util');
  var timeout = 1000;

  // var nit = '295671015';
  models.empresa.findAll({
      order: [
        ['id_empresa', 'DESC']
      ],
      limit: 1,
      raw: true
    })
    .then(function (params) {
      if (params.length > 0) {
        console.log('params.nit', params[0].nit);
      } else {
        console.log("no hay nada. primera vez")
        util.iterarArray(nits, function (nit, callbackContinuar, callbackError) {
            setTimeout(function () {
              servicios.obtenerMatriculas(nit)
                .then(function (resp) {
                  console.log(resp);
                  callbackContinuar();
                })
                .catch(function (respErr) {
                  console.log(respErr);
                  callbackContinuar();
                });
            }, timeout);
          })
          .then(function (res) {
            console.log('TERMINADO');
          })
          .catch(function (resErr) {
            console.log('err ', resErr);
          });
      }
    })
    .catch(function (params) {
      console.log('errr', params);
    });