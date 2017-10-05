  let servicios = require('./interoperabilidad/servicios_web');
  let nits = require('./data/nits');
  let models = require('./models');
  let timeout = 120000;

  let trabajo = function (misNits) {
    let nitsX = misNits
    async function nitf(elNit) { //async to obtain matriculas for a nit
      return await servicios.obtenerMatriculas(elNit)
    }
    async function matrf(laMatr) { //async to obtain info business for a matricula
      return await servicios.obtenerInformacionEmpresa(laMatr)
    }
    nitsX.forEach(function (nit, i) {
      setTimeout(function () {
        nitf(nit)
          .then(resNit => {
            if (resNit.matriculas.length > 0) { //tiene matriculas
              for (let j in resNit.matriculas) {
                setTimeout(function () {
                  matrf(resNit.matriculas[j].matricula)
                    .then(resMatr => {
                      if (resMatr.status == 200) {
                        models.empresa.create({
                          nit,
                          nit_json: resNit,
                          matricula_comercio: resNit.matriculas[j].matricula,
                          matricula_comercio_json: resMatr,
                          estado: "ACTIVO"
                        })
                      } else {
                        console.log("Hubo un error. Tal vez el sistema esta abajo ", resMatr);
                        return
                      }
                    })
                    .catch(resMatrErr => {
                      console.log("resMatrErr ", resMatrErr);
                    })
                }, 1000 * (j + 1));
              }
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
      }, timeout * (i + 1));
    });
  }
  ////////////////////  
  /////////////////// EMPIEZA AQUI
  ////////////////////
  models.empresa.findAll({
      order: [
        ['id_empresa', 'DESC']
      ],
      limit: 1,
      raw: true
    })
    .then(function (params) {
      if (params.length > 0) { // console.log('Problemas. Se reiniciara despues del NIT:', params[0].nit);
        console.log("empezamos desde el ultimo ", params[0].nit);
        let nitsFinal = nits.slice(nits.indexOf(params[0].nit), nits.length);
        trabajo(nitsFinal)
      } else {
        trabajo(nits)
      }
    })
    .catch(function (params) {
      console.log('errr', params);
    });