  var servicios = require('./interoperabilidad/servicios_web');
  var nits = require('./data/nits2');
  var models = require('./models');
  var util = require('./util/util');
  var timeout = 1000;

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
        var nitsFinal = nits.slice(nits.indexOf(params[0].nit), nits.length);
        // aqu copiar lo que eta por else. reemplazando nitsFinal
      } else {
        console.log('no hay nada. primera vez');
        util.iterarArray(nits, function (nit, callbackContinuar, callbackError) {
            setTimeout(function () {
              servicios.obtenerMatriculas(nit)
                .then(function (resp) {
                  console.log(resp)
                  if (resp.matriculas.length > 0) { //tiene matriculas

                  } else { //no tiene matricualas
                    models.empresa.create({
                      nit,
                      estado: 'SIN_MATRICULA'
                    });
                  }
                  // inicio iterar por matriculas
                  // fin iterar por matriculas
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