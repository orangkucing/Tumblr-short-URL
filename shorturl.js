(function (K) {

// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
K.tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi"; // CHANGE HERE IF NEEDED

K.user_timeline = "http://www.tumblr.com/statuses/user_timeline.json";
K.msgs = {
    notumblelog: "This URL is not a Tumblr blog...",
    loading: "Loading...",
    woops: "Woops. The blog contains only uncommented reblogs..."
};

K.execJson = function (u) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = K.tunnel + "?api=" + u.replace(/\?/, "&");
    document.getElementsByTagName("body")[0].appendChild(s);
}

K.show = function (s) {
    document.getElementById(K.myname + "_buf").innerHTML =
    (K.screenName && "<div>name: " + K.screenName + (K.userId && " (" + K.userId + ")") + "</div>") +
    (K.reblogKey && "<div>reblog key: " + K.reblogKey + "</div>") +
    (K.shortURLPrefix &&
        "<div>short URL: " +
        "<input " +
        "type=\"text\" " +
        "value=\"http://tumblr.com/x" + K.shortURLPrefix + parseInt(K.postId, 10).toString(36) + "\" " +
        "readonly=\"readonly\" " + 
        "onclick=\"this.select();\" " +
        "size=\"31\" " +
        "/>" + "</div>") +
    (K.statusId && "<div>status ID: " + K.statusId + "</div>") +
    (s && "<div>" + K.msgs[s] + "</div>");
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
            if (parseInt(K.postId, 10) == parseInt(obj[i].id / 65536, 10)) {
                K.statusId = obj[i].id;
                if (K.shortURLPrefix) {
                    K.show("");
                    return;
                }
                K.show("loading");
            }
        if (!K.shortURLPrefix)
            if (!obj[i].text.match(/^RT/) && (m = obj[i].text.match(/http:\/\/tumblr\.com\/x([\da-z]{2,2})/))) {
                K.shortURLPrefix = m[1];
                if (!f || K.statusId) {
                    K.show("");
                    return;
                }
                K.show("loading");
            }
    }
    K.execJson(K.user_timeline + "?screen_name=" + K.screenName + "&callback=" + K.myname + ".P&count=200&page=" + ++K.page);
}

K.SN = function (obj) {
    if (arguments.length != 1 || !obj.tumblelog.name || !obj.posts[0]["reblog-key"]) {
        K.show("notumblelog");
        return;
    }
    K.screenName = obj.tumblelog.name;
    K.reblogKey = obj.posts[0]["reblog-key"];
    K.show("loading");
    K.page = 0;
    K.P("");
}

K.result = function () {
    K.statusId = "";
    K.shortURLPrefix = "";
    K.screenName = "";
    K.reblogKey = "";
    K.userId = "";
    var m = document[K.myname + "_inputform"].url.value.match(/^(.*)\/post\/([\d]+)/);
    if (!m) {
        K.show("notumblelog");
        return;
    }
    var basename = m[1];
    K.postId = m[2];
    K.show("loading");
    K.execJson(basename + "/api/read/json?callback=" + K.myname + ".SN&id=" + K.postId);
}

document.write("<form name=\"" + K.myname + "_inputform\">");
document.write("<div>Permalink:</div>");
document.write("<div><input type=\"text\" name=\"url\" maxlength=\"1000\" size=\"46\"></div>");
document.write("<div><input type=\"button\" value=\"Shorten\" onclick=\"" + K.myname + ".result();\">");
document.write("<input type=\"checkbox\" name=\"detail\">Show status ID</div>");
document.write("<div id=\"" + K.myname + "_buf\"></div>");
document.write("</form>");

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
