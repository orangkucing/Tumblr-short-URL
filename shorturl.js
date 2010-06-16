(function (K) {

K.result = {
    id: "",
    screen_name: "",
    userID: "",
    "reblog-key": "",
    shortURL: "",
    statusID: ""
};

// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
/* const */ var tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi"; // CHANGE HERE IF NEEDED

K.execJson = function () {
    var s = document.createElement("script");
    s.src = tunnel + "?";
    for (var i = 0; i < arguments.length; i++) 
        s.src += arguments[i] + (K.result[arguments[i]] ? "=" + K.result[arguments[i]] : "") + "&";
    document.getElementsByTagName("body")[0].appendChild(s);
}

K.show = function (s) {
    /* const */ var msgs = {
        notumblelog: "This URL is not a Tumblr blog...",
        loading: "Loading...",
        woops: "Woops. Something strange happened..."
    };
    var c = "";
    for (var i in K.result)
        c += K.result[i] && "<div>" + i + ": " + K.result[i] + "</div>";
    document.getElementById(K + "_buf").innerHTML = c + (s && "<div>" + msgs[s] + "</div>");
}

K.U = function (obj) {
    if (obj == undefined)
        return K.show("woops");
    var f = document[K + "_inputform"].detail.checked;
    var m;
    for (var i = 0; i < obj.length; i++) {
        if (!K.result.userID) {
            K.result.userID = obj[i].user.id;
            K.show("loading");
        }
        if (f && !K.result.statusID && parseInt(K.result.id, 10) == parseInt(obj[i].id / 65536, 10)) {
            K.result.statusID = obj[i].id;
            if (K.result.shortURL)
                return K.show("");
            K.show("loading");
        }
        if (!K.result.shortURL && !obj[i].text.match(/^RT/) && ((m = obj[i].text.match(/http:\/\/tumblr\.com\/x([\da-z]{2,2})/)))) {
            K.result.shortURL = "<input type='text' readonly='readonly' onclick='this.select();' style='width:190px;' value='http://tumblr.com/x" + m[1] + parseInt(K.result.id, 10).toString(36) + "'>";
            if (!f || K.result.statusID)
                return K.show("");
            K.show("loading");
        }
    }
    if (K.result.userID)
        return K.show("woops");
    K.execJson("api=http://www.tumblr.com/statuses/user_timeline.json", "screen_name", "callback=" + K + ".U", "count=200");
}

K.N = function (obj) {
    if (!obj || !obj.tumblelog.name || !obj.posts[0]["reblog-key"])
        return K.show("notumblelog");
    K.result.screen_name = obj.tumblelog.name;
    K.result["reblog-key"] = obj.posts[0]["reblog-key"];
    K.show("loading");
    K.U("");
}

K.G = function () {
    for (var i in K.result)
        K.result[i] = "";
    var m = document[K + "_inputform"].url.value.match(/^(.*)\/post\/([\d]+)/);
    if (!m)
        return K.show("notumblelog");
    K.result.id = m[2];
    K.show("loading");
    K.execJson("api=" + m[1] + "/api/read/json", "callback=" + K + ".N", "id");
}

/* const */ var watermark = "Tumblr permalink...";
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
