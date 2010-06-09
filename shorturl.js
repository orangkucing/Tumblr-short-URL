(function (K) {

// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
K.tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi"; // CHANGE HERE IF NEEDED

K.user_timeline = "http://www.tumblr.com/statuses/user_timeline.json";
K.msgs = {
    notumblelog: "This URL is not a Tumblr blog...",
    loading: "Loading...",
};

K.execJson = function (t, u) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = t ? u.replace(/^[^?]*\?/, t + '?') : u;
    document.getElementsByTagName("body")[0].appendChild(s);
}

K.show = function (s) {
    function base36String (n) {
        var m = "";
        var r;
        do {
            r = n % 36;
            m = "0123456789abcdefghijklmnopqrstuvwxyz".substring(r,r+1).concat(m);
            n = (n - r) / 36;
        } while (n);
        return m;
    }
    document.getElementById(K.myname + "_buf").innerHTML =
    (K.screenName ?
        "screen name:&nbsp;" + K.screenName + (K.userId ? " (user ID:&nbsp;" + K.userId + ")" : "") +
    "<br />" : "") +
    (K.reblogKey ?
        "reblog key:&nbsp;" + K.reblogKey +
    "<br />" : "") +
    (K.shortURLPrefix ?
        "short URL:&nbsp;" +
        "<input " +
        "type=\"text\" " +
        "value=\"http://tumblr.com/x" + K.shortURLPrefix + base36String(K.postId) + "\" " +
        "readonly=\"readonly\" " + 
        "onclick=\"this.select();\" " +
        "style=\"font: 11px \'Lucida Grande\',Verdana,sans-serif; width: 175px;\" " +
        "/>" +
    "<br />" : "") +
    (K.statusId ?
        "status ID:&nbsp;" + K.statusId +
    "<br />" : "") +
    (s ? K.msgs[s] : "");
}

K.P = function (obj) {
    var f = document[K.myname + "_inputform"].detail.checked;
    if (K.page) {
        var i;
        var m;
        K.userId = obj[0].user.id;
        K.show("loading");
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
                if (!obj[i].text.match(/^RT/) && (m = obj[i].text.match(/http:\/\/tumblr\.com\/x([0-9a-z]{2,2})[0-9a-z]+/))) {
                    K.shortURLPrefix = m[1];
                    if (!f || K.statusId) {
                        K.show("");
                        return;
                    }
                    K.show("loading");
                }
        }
    }
    K.execJson(K.tunnel, K.user_timeline + "?screen_name=" + K.screenName + "&callback=" + K.myname + ".P&count=200&page=" + ++K.page);
}

K.SN = function (obj) {
    if (!obj.tumblelog.name || !obj.posts[0]["reblog-key"]) {
        K.show("notumblelog");
        return;
    }
    K.screenName = obj.tumblelog.name;
    K.reblogKey = obj.posts[0]["reblog-key"];
    K.show("loading");
    K.page = 0;
    K.P(null);
}

K.result = function () {
    var m = document[K.myname + "_inputform"].url.value.match(/^(http:\/\/.*)\/post\/([0-9]+)/);
    var basename = m[1];
    K.postId = m[2];
    delete K.statusId;
    delete K.shortURLPrefix;
    delete K.screenName;
    delete K.reblogKey;
    delete K.userId;
    K.show("loading");
    K.execJson(false, basename + "/api/read/json?callback=" + K.myname + ".SN&id=" + K.postId);
}

document.write("<form name=\"" + K.myname + "_inputform\">");
document.write("Permalink:");
document.write("<br />");
document.write("<input type=\"text\" name=\"url\" maxlength=\"1000\" size=\"40\">");
document.write("<br />");
document.write("<input type=\"button\" value=\"Shorten\" onclick=\"" + K.myname + ".result();\">");
document.write("<input type=\"checkbox\" name=\"detail\">Show status ID");
document.write("</form>");
document.write("<div id=\"" + K.myname + "_buf\">");
document.write("</div>");

})((function (global_obj_name) {
// portability considerations:
// 1. everything belongs to one object named orngkcng_sXX 
// 2. where XX is the position of inclusion of this script
// since multiple use can be happen in one tumblelog page.
var pos = document.getElementsByTagName('script').length - 1;
eval(global_obj_name + pos + " = new Object();");
eval(global_obj_name + pos + ".myname = \"" + global_obj_name + pos + "\";");
return eval(global_obj_name + pos);
})(
"orngkcng_s" // CHANGE HERE IF NEEDED
));
