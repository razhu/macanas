  let servicios = require('./interoperabilidad/servicios_web');
  let nits = require('./data/nits2');
  let models = require('./models');
  let util = require('./util/util');
  let timeout = 15000;
  let timeout2 = 5000;

  models.empresa.findAll({
      order: [
        ['id_empresa', 'DESC']
      ],
      limit: 1,
      raw: true
    })
    .then(function (params) {
      if (params.length > 0) { // console.log('Problemas. Se reiniciara despues del NIT:', params[0].nit);
        // var nitsFinal = nits.slice(nits.indexOf(params[0].nit), nits.length);
        // // aqu copiar lo que eta por else. reemplazando nitsFinal
      } else {
        async function nitf(elNit) {//async to obtain matriculas for a nit
          return await servicios.obtenerMatriculas(elNit)
        }
        async function matrf(laMatr) {//async to obtain info business for a matricula
          return await servicios.obtenerInformacionEmpresa(laMatr)
        }
        nits.forEach(function (nit) {
          setTimeout(function() {
          nitf(nit)
            .then(resNit => {
              if (resNit.matriculas.length > 0) { //tiene matriculas
                resNit.matriculas.forEach(function (matri) {
                  matrf(matri.matricula)
                    .then(resMatr => {
                      models.empresa.create({
                        nit,
                        nit_json: resNit,
                        matricula_comercio: matri.matricula,
                        matricula_comercio_json: resMatr,
                        estado: "ACTIVO"
                      })
                    })
                    .catch(resMatrErr => {
                      console.log("resMatrErr ", resMatrErr);
                    })
                });
              } else { //no tiene matriculas
                models.empresa.create({
                  nit,
                  nit_json: resNit,
                  estado: "SIN_MATRICULA"
                })
              }
            })
            .catch(err => {
              console.log('err ', err);
            })
          }, timeout);
        });
      }
    })
    .catch(function (params) {
      console.log('errr', params);
    });