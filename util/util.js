/* 
 * Metodos utiles de uso generico
 * Agregar mas metodos necesarios
 */

module.exports = 
{
        iterarArray:function (array,callbackProcesarItem)
        {
            
            return new Promise(function(resolve,reject)
            {
                var callbackError = function(error)
                {
                        reject(error);
                };
                var indice = 0;
                var LIMITE_ARRAY = array.length;
                if(LIMITE_ARRAY===0)
                {
                        resolve();
                        return;
                }
                
                var arrayResult = new Array();
                var callbakContinuarIteracion = function()
                {
                    indice++;
                    if(indice < LIMITE_ARRAY)
                    {
                            var aa = callbackProcesarItem(array[indice],callbakContinuarIteracion,callbackError);
                            arrayResult.push(aa);
                    }
                    else
                    {
                            resolve(arrayResult);
                    }
                };
                var cc = callbackProcesarItem(array[indice],callbakContinuarIteracion,callbackError);
                arrayResult.push(cc);
            });
        }
};