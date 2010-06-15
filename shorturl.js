(function (K) {

// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
const tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi"; // CHANGE HERE IF NEEDED

K.execJson = function () {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = tunnel + "?";
    for (var i = 0; i < arguments.length; i++)
        s.src += arguments[i] + "=" + K[arguments[i]] + "&";
    document.getElementsByTagName("body")[0].appendChild(s);
}

K.show = function (s) {
    var w = function () {
        const msgs = {
            notumblelog: "This URL is not a Tumblr blog...",
            loading: "Loading...",
            woops: "Woops. Something strange happened..."
        };
        var c = arguments[0] && "<div>" + msgs[arguments[0]] + "</div>";
        for (var i = arguments.length - 1; i > 0; i--)
            c = (K[arguments[i]] && "<div>" + arguments[i] + ": " + K[arguments[i]] + "</div>") + c;
        return c;
    }
    document.getElementById(K + "_buf").innerHTML = w(s, "screen_name", "userID", "reblog-key", "shortURL", "statusID");
}

K.U = function (obj) {
    if (arguments.length != 1) {
        K.show("woops");
        return;
    }
    var f = document[K + "_inputform"].detail.checked;
    var m;
    if (K.page == 1) {
        K.userID = obj[0].user.id;
        K.show("loading");
    }
    for (var i = 0; i < obj.length; i++) {
        if (f && !K.statusID)
            if (parseInt(K.id, 10) == parseInt(obj[i].id / 65536, 10)) {
                K.statusID = obj[i].id;
                if (K.shortURL) {
                    K.show("");
                    return;
                }
                K.show("loading");
            }
        if (!K.shortURL)
            if (!obj[i].text.match(/^RT/) && ((m = obj[i].text.match(/http:\/\/tumblr\.com\/x([\da-z]{2,2})/)))) {
                K.shortURL = "<input type='text' readonly='readonly' onclick='this.select();' style='width:190px;' value='http://tumblr.com/x" + m[1] + parseInt(K.id, 10).toString(36) + "'>";
                if (!f || K.statusID) {
                    K.show("");
                    return;
                }
                K.show("loading");
            }
    }
    if (K.page == 1) { // API does not support page parameter yet
        K.show("woops");
        return;
    }
    K.callback = K + ".U";
    K.count = 200;
    K.page++;
    K.api = "http://www.tumblr.com/statuses/user_timeline.json";
    K.execJson("api", "screen_name", "callback", "count", "page");
}

K.N = function (obj) {
    if (arguments.length != 1 || !obj.tumblelog.name || !obj.posts[0]["reblog-key"]) {
        K.show("notumblelog");
        return;
    }
    K.screen_name = obj.tumblelog.name;
    K["reblog-key"] = obj.posts[0]["reblog-key"];
    K.show("loading");
    K.page = 0;
    K.U("");
}

K.G = function () {
    K.statusID = "";
    K.shortURL = "";
    K.screen_name = "";
    K["reblog-key"] = "";
    K.userID = "";
    var m = document[K + "_inputform"].url.value.match(/^(.*)\/post\/([\d]+)/);
    if (!m) {
        K.show("notumblelog");
        return;
    }
    K.id = m[2];
    K.callback = K + ".N";
    K.api = m[1] + "/api/read/json";
    K.show("loading");
    K.execJson("api", "callback", "id");
}

const watermark = "Tumblr permalink...";
document.write(
"<form name='" + K + "_inputform'>" +
  "<div>" +
    "<input type='text' name='url' style='width:260px;' " +
      "value='" + watermark + "' " +
      "onfocus=\"if (this.value == '" + watermark + "') {this.value = '';}\" " +
      "onblur=\"if (this.value == '') {this.value = '" + watermark + "';}\">" +
  "</div>" +
  "<div>" + 
    "<input type='button' value='Shorten' onclick='" + K + ".G();'>" +
    "<input type='checkbox' name='detail'>Show statusID" +
  "</div>" +
  "<div id='" + K + "_buf'></div>" +
"</form>");

})((function (g) {
return eval(g + " = { toString: function () { return '" + g + "'; } };");
})(
"orngkcng_s" // CHANGE HERE IF NEEDED
+ document.getElementsByTagName("script").length
));
