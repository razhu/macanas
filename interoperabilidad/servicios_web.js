var messages = {
  '404': 'No se pudo encontrar el servicio solicitado.',
  '508': 'El servicio no responde',
  '503': 'El servicio no esta disponible en estos momentos',
  '502': 'Bad Gatenway',
  '504': 'El tiempo para la respuesta a expirado',
  '501': 'No implementado',
  '200': 'Datos recuperados correctamente',
  '400': 'Peticion incorrecta',
  '401': 'No se encontraron resultados',
  '403': 'No se tiene los permisos necesarios',
  '500': 'Error interno en el servidor'
};
var servicios = {};
servicios.obtenerMatriculas = function (nit) {
  return new Promise(function (resolve, reject) {
    var config = require('../config/app');
    var urlServicio = config.servicios_externos.funda_empresa.servicios.obtener_matriculas + nit + '/matriculas/';
    var request = require('request');
    var req = {
      url: urlServicio,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + config.servicios_externos.funda_empresa.jwt,
        'Content-Type': 'application/json'
      },
      json: true
    };
    request.get(req, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      var lasmatriculas = [];
      if (body && body.SrvMatriculaConsultaNitResult && body.SrvMatriculaConsultaNitResult.MatriculasResult && body.SrvMatriculaConsultaNitResult.MatriculasResult.length) {
        body.SrvMatriculaConsultaNitResult.MatriculasResult.forEach(function (matricula) {
          if (matricula['CtrResult'] && matricula['CtrResult'] === 'D-EXIST') {
            lasmatriculas.push({
              matricula: (parseInt(matricula.IdMatricula)).toString(),
              razon_social: matricula.RazonSocial
            });
          }
        });
      }
      if (lasmatriculas.length === 0) {
        var mensaje = '';
        if (body === 'The upstream server is timing out') {
          mensaje = 'El servicio no esta disponible. Intente otra vez.';
        } else {
          mensaje = body;
        }
        resolve({
          status: 401,
          matriculas: lasmatriculas,
          mensaje: 'El NIT ' + nit + ' parece no contar con matrículas registradas o activas en FUNDEMPRESA',
          data: mensaje
        });
      } else {
        resolve({
          status: response.statusCode === 404 ? 401 : response.statusCode,
          matriculas: lasmatriculas,
          mensaje: messages[response.statusCode + ''],
          data: body
        });
      }
    });
  });
};

servicios.obtenerInformacionEmpresa = function (nroMatricula) {
  return new Promise(function (resolve, reject) {
    var removerAcentos = function (text) {
      var strOut = '';
      if (text) {
        strOut = text;
      }
      strOut = strOut.replace(/á/gi, 'a');
      strOut = strOut.replace(/é/gi, 'e');
      strOut = strOut.replace(/í/gi, 'i');
      strOut = strOut.replace(/ó/gi, 'o');
      strOut = strOut.replace(/ú/gi, 'u');

      strOut = strOut.replace(/Á/gi, 'A');
      strOut = strOut.replace(/É/gi, 'E');
      strOut = strOut.replace(/Í/gi, 'I');
      strOut = strOut.replace(/Ó/gi, 'O');
      strOut = strOut.replace(/Ú/gi, 'U');
      return (strOut.toUpperCase());
    };

    var config = require('../config/app');
    var urlServicio = config.servicios_externos.funda_empresa.servicios.info_matricula + nroMatricula;
    var request = require('request');
    var req = {
      url: urlServicio,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + config.servicios_externos.funda_empresa.jwt,
        'Content-Type': 'application/json'
      },
      json: true
    };
    request.get(req, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      var infoEmpresa;
      if (response.statusCode === 200) {
        if (!body.hasOwnProperty('detalle')) {
          reject(body);
          return;
        }
        if (!body.detalle.hasOwnProperty('infoMatricula')) {
          reject(body);
          return;
        }

        // if (typeof body.detalle === 'undefined') {
        //   reject(body);
        //   return;
        // }
        // if (typeof body.detalle.infoMatricula === 'undefined') {
        //   reject(body);
        //   return;
        // }
        // if (typeof body.detalle.infoMatricula != "object") {
        //   reject(body);
        //   return;
        // }
        infoEmpresa = {
          nit: null,
          matricula_comercio: null,
          razon_social: null,
          tipo_sociedad: null,
          fecha_inscripcion: null,
          sucursales: []
        };
        var moment = require('moment');
        var matricula = body.detalle.infoMatricula;
        infoEmpresa.nit = parseInt(matricula.Nit) + '';
        infoEmpresa.matricula_comercio = (parseInt(matricula.IdMatricula)).toString();
        infoEmpresa.razon_social = matricula.RazonSocial;
        infoEmpresa.tipo_sociedad = matricula.TipoSocietario;
        //                2017-01-24
        var date = moment(matricula.FechaInscripcion).format('YYYY-MM-DD');
        infoEmpresa.fecha_constitucion = date;
        infoEmpresa.desc_actividad_declarada = matricula.Actividad;
        infoEmpresa.actividad_declarada = matricula.ClaseCIIU;
        // Agregamos la sucursal CASA MATRIZ
        infoEmpresa.sucursales.push({
          nombre: matricula.RazonSocial,
          nro_sucursal: 0,
          avenida_calle: matricula.CalleAv,
          numero: matricula.Nro,
          zona: matricula.Zona ? matricula.Zona.toUpperCase() : null,
          uv: matricula.Uv,
          manzana: matricula.Mza,
          edificio: matricula.Edificio,
          piso: matricula.Piso,
          nro_oficina: matricula.NroOficina,
          nro_casilla_postal: null,
          municipio: matricula.Municipio.toUpperCase(),
          provincia: matricula.Provincia.toUpperCase(),
          departamento: removerAcentos(matricula.Departamento.toUpperCase()),
          telefonos: matricula.Telefono ? matricula.Telefono : null,
          fax: null,
          correos: matricula.CorreoElectronico,
          avenida_calle_referencia: matricula.EntreCalles,
          tipo_sucursal: '1',
          direccion_completa: null
        });
        // Agregando sucursales de la matricula de comercio
        if (body.detalle.infoMatricula.hasOwnProperty('MatriculaDatosSucList1')) {
          var arraySucursales = body.detalle.infoMatricula.MatriculaDatosSucList1.MatriculaDatosSuc;
          for (var index in arraySucursales) {
            var sucursalFund = arraySucursales[index];
            infoEmpresa.sucursales.push({
              nombre: sucursalFund.Sucursal,
              nro_sucursal: sucursalFund.IdSuc,
              municipio: sucursalFund.Municipio.toUpperCase(),
              zona: sucursalFund.Zona.toUpperCase(),
              provincia: null,
              tipo_sucursal: '2',
              departamento: removerAcentos(sucursalFund.Departamento.toUpperCase()),
              scompleto: sucursalFund.Representante,
              codigo_tipo_documento: sucursalFund.IdClase,
              nro_documento: sucursalFund.NumId,
              direccion_completa: sucursalFund.Direccion,
              telefonos: sucursalFund.Telefono,
              representante_legal: {
                nombre_completo: sucursalFund.Representante,
                codigo_tipo_documento: !sucursalFund.IdClase ? null : sucursalFund.IdClase,
                nro_documento: !sucursalFund.NumId ? null : sucursalFund.NumId
              }
            });
          }
        }
        resolve({
          status: response.statusCode,
          empresa: infoEmpresa,
          mensaje: messages[response.statusCode + ''],
          data: body
        });
      } else {
        resolve(messages[response.statusCode + '']);
      }
    }); // Fin del GET
  }); // Fin de la promesa
};

module.exports = servicios;