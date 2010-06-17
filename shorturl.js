(function (K) {

var results = {
    "reblog-key": "",
    screen_name: "",
    userID: "",
    shortURL: "",
    statusID: ""
};

var id;
var page; // unfortunately, page is not yet supported by Tumblr's Twitter compatible API

var execJson = function () {
// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
    /* const */ var tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi"; // CHANGE HERE IF NEEDED

    var s = document.createElement("script");
    s.src = tunnel + "?";
    for (var i = 0; i < arguments.length; i++) 
        s.src += arguments[i] + "&";
    s.src += "callback=" + K + ".callback";
    document.getElementsByTagName("body")[0].appendChild(s);
}

var show = function (s) {
    /* const */ var msgs = {
        notumblelog: "This URL is not a Tumblr blog...",
        loading: "Loading...",
        woops: "Woops. Something strange happened..."
    };
    var c = "";
    for (var i in results)
        c += results[i] && "<div>" + i + ": " + results[i] + "</div>";
    c += s && "<div>" + msgs[s] + "</div>";
    document.getElementById(K + "_div").innerHTML = c;
}

K.callback = function (obj) {
    if (!results.screen_name) {
        if (!obj || !obj.tumblelog.name || !obj.posts[0]["reblog-key"])
            return show("notumblelog");
        results.screen_name = obj.tumblelog.name;
        results["reblog-key"] = obj.posts[0]["reblog-key"];
        show("loading");
        obj = "";
        page = 0;
    }
    var f = document[K + "_form"].detail.checked;
    var m;
    for (var i = 0; i < obj.length; i++) {
        if (!results.userID) {
            results.userID = obj[i].user.id;
            show("loading");
        }
        if (f && !results.statusID && parseInt(id, 10) == parseInt(obj[i].id / 65536, 10)) {
            results.statusID = obj[i].id;
            if (results.shortURL)
                return show("");
            show("loading");
        }
        if (!results.shortURL && !obj[i].text.match(/^RT/) && ((m = obj[i].text.match(/http:\/\/tumblr\.com\/x([\da-z]{2,2})/)))) {
            results.shortURL = 
                "<input type='text' readonly='readonly' onclick='this.select();' style='width:190px;' " +
                "value='http://tumblr.com/x" + m[1] + parseInt(id, 10).toString(36) + "'>";
            if (!f || results.statusID)
                return show("");
            show("loading");
        }
    }
    if (obj == undefined || ++page == 2)
        return show("woops");
    execJson("api=http://www.tumblr.com/statuses/user_timeline.json", "screen_name=" + results.screen_name, "count=200", "page=" + page);
}

K.onclick = function () {
    for (var i in results)
        results[i] = "";
    var m = document[K + "_form"].url.value.match(/^(.*)\/post\/([\d]+)/);
    if (!m)
        return show("notumblelog");
    id = m[2];
    show("loading");
    execJson("api=" + m[1] + "/api/read/json", "id=" + id);
}

/* const */ var watermark = "Tumblr permalink...";
document.write(
    "<form name='" + K + "_form'>" +
        "<div>" +
            "<input type='text' name='url' style='width:260px;' " +
            "value='" + watermark + "' " +
            "onfocus=\"if (this.value == '" + watermark + "') {this.value = '';}\" " +
            "onblur=\"if (this.value == '') {this.value = '" + watermark + "';}\">" +
        "</div>" +
        "<div>" + 
            "<input type='button' value='Shorten' onclick='" + K + ".onclick();'>" +
            "<input type='checkbox' name='detail'>Show statusID" +
        "</div>" +
        "<div id='" + K + "_div'></div>" +
    "</form>");

})((function (g) {
return eval(g + " = { toString: function () { return '" + g + "'; } };");
})(
"orngkcng_s" // CHANGE HERE IF NEEDED
+ document.getElementsByTagName("script").length
));
