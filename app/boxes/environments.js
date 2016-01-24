
function urlMonitor(env, onOk, onNotOk, onError) {

  function checkUrlAndUpdateDivs(urlPath) {

    var xmlHttp = new XMLHttpRequest();

    function handleError() {
      onError("Error reaching network or dashboard server");
    }

    xmlHttp.onload = function () {
      if (xmlHttp.readyState === 4) {
        var response = xmlHttp.responseText;
        if(response.indexOf("OK") === 0) {
          onOk(xmlHttp.responseText);
        } else {
          onNotOk(xmlHttp.responseText);
        }

      }
    };
    xmlHttp.onerror = function (e) {
      handleError();
    };

    xmlHttp.open("GET", location.origin + urlPath + env, true);
    xmlHttp.send(null);

  }

  function monitorApp() {
    return checkUrlAndUpdateDivs('/health/');
  }

  monitorApp();
  setInterval(monitorApp, 10000);

}
