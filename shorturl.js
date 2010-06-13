(function (K) {

// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
const tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi"; // CHANGE HERE IF NEEDED

const watermark = "Tumblr permalink...";
const msgs = {
    notumblelog: "This URL is not a Tumblr blog...",
    loading: "Loading...",
    woops: "Woops. Something strange happened..."
};

K.execJson = function () {
    var i;
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = tunnel + "?";
    for (i = 0; i < arguments.length; i++)
        s.src += arguments[i] + "=" + K[arguments[i]] + "&";
    document.getElementsByTagName("body")[0].appendChild(s);
}

K.show = function (s) {
    var w = function (c, s) {
        return c && "<div>" + s + "</div>";
    }
    document.getElementById(K.myname + "_buf").innerHTML =
    w(K.screen_name, "name: " + K.screen_name + (K.userId &&  " (" + K.userId + ")")) +
    w(K.reblogKey, "reblog key: " + K.reblogKey) +
    w(K.shortURLPrefix,
        "short URL: <input type=\"text\" readonly=\"readonly\" onclick=\"this.select();\" style=\"width:190px;\" " +
        "value=\"http://tumblr.com/x" + K.shortURLPrefix + parseInt(K.id, 10).toString(36) + "\">") +
    w(K.statusId, "status ID: " + K.statusId) +
    w(s, msgs[s]);
}

K.P = function (obj) {
    if (arguments.length != 1) {
        K.show("woops");
        return;
    }
    var f = document[K.myname + "_inputform"].detail.checked;
    var i;
    var m;
    if (K.page == 1) {
        K.userId = obj[0].user.id;
        K.show("loading");
    }
    for (i = 0; i < obj.length; i++) {
        if (f && !K.statusId)
            if (parseInt(K.id, 10) == parseInt(obj[i].id / 65536, 10)) {
                K.statusId = obj[i].id;
                if (K.shortURLPrefix) {
                    K.show("");
                    return;
                }
                K.show("loading");
            }
        if (!K.shortURLPrefix)
            if (!obj[i].text.match(/^RT/) && ((m = obj[i].text.match(/http:\/\/tumblr\.com\/x([\da-z]{2,2})/)))) {
                K.shortURLPrefix = m[1];
                if (!f || K.statusId) {
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
    K.callback = K.myname + ".P";
    K.count = 200;
    K.page++;
    K.api = "http://www.tumblr.com/statuses/user_timeline.json";
    K.execJson("api", "screen_name", "callback", "count", "page");
}

K.SN = function (obj) {
    if (arguments.length != 1 || !obj.tumblelog.name || !obj.posts[0]["reblog-key"]) {
        K.show("notumblelog");
        return;
    }
    K.screen_name = obj.tumblelog.name;
    K.reblogKey = obj.posts[0]["reblog-key"];
    K.show("loading");
    K.page = 0;
    K.P("");
}

K.result = function () {
    K.statusId = "";
    K.shortURLPrefix = "";
    K.screen_name = "";
    K.reblogKey = "";
    K.userId = "";
    var m = document[K.myname + "_inputform"].url.value.match(/^(.*)\/post\/([\d]+)/);
    if (!m) {
        K.show("notumblelog");
        return;
    }
    var basename = m[1];
    K.id = m[2];
    K.show("loading");
    K.callback = K.myname + ".SN";
    K.api = basename + "/api/read/json";
    K.execJson("api",  "callback", "id");
}

document.write(
"<form name=\"" + K.myname + "_inputform\">" +
"<div>" +
"<input type=\"text\" name=\"url\" style=\"width:260px;\" " +
"value=\"" + watermark + "\" " +
"onfocus=\"if (this.value == \'" + watermark + "\') {this.value = \'\';}\" " +
"onblur=\"if (this.value == \'\') {this.value = \'" + watermark + "\';}\">" +
"</div>" +
"<div>" + 
"<input type=\"button\" value=\"Shorten\" onclick=\"" + K.myname + ".result();\">" +
"<input type=\"checkbox\" name=\"detail\">Show status ID" +
"</div>" +
"<div id=\"" + K.myname + "_buf\"></div>" +
"</form>");

})((function (global_obj_name) {
// portability considerations:
// 1. everything belongs to one object named orngkcng_sXX 
// 2. where XX is the position of inclusion of this script
// since multiple use can be happen in one tumblelog page.
var pos = document.getElementsByTagName("script").length - 1;
eval(global_obj_name + pos + " = new Object();");
eval(global_obj_name + pos + ".myname = \"" + global_obj_name + pos + "\";");
return eval(global_obj_name + pos);
})(
"orngkcng_s" // CHANGE HERE IF NEEDED
));
