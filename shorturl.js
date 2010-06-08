// everything is contained in one global object.
orangkucing_shorturl = new Object();
orangkucing_shorturl.myname = "orangkucing_shorturl";

(function (K) {

// since Tumblr's Twitter compatible API supports JSON but JSONP
// we need a CGI server to pad a callback function name.
K.tunnel = "http://onecotravel.info/cgi-bin/tumblr/tunnel.cgi";

K.user_timeline = "http://www.tumblr.com/statuses/user_timeline.json";

K.execJson = function (t, u) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = t ? K.tunnel + '?url=' + u.replace(/\?/, '&') : u;
    document.getElementsByTagName("body")[0].appendChild(s);
}

K.show = function (loading) {
    var base36 = new Array(
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
        "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z" );
    function base36String (n) {
        var m = "";
        var r;
        do {
            r = n % 36;
            m = base36[r].concat(m);
            n = (n - r) / 36;
        } while (n);
        return m;
    }

    var shorturl = "http://tumblr.com/x" + K.shortURLPrefix + base36String(K.postId);
    var status_id_item = "";
    if (K.statusId) {
        status_id_item = "status ID:&nbsp;" + K.statusId + "<br />";
    }
    document.getElementById(K.myname + "_buf").innerHTML =
	"<p>" +
    "short URL:&nbsp;" + "<a href=\"" + shorturl + "\">" + shorturl + "</a><br />" + 
    "screen name:&nbsp;" + K.screenName + " (user ID:&nbsp;" + K.userId + ")<br />" +
    "reblog key:&nbsp;" + K.reblogKey + "<br />" +
    status_id_item + loading +
    "</p>";
}

K.readStatusId = function (obj) {
    if (K.page) {
        var i;
        for (i = 0; ; i++) {
            if (!obj[i]) break;
            if (parseInt(K.postId) == parseInt(obj[i].id / 65536)) {
                K.statusId = obj[i].id;
                break;
            }
        }
    }
    if (!K.statusId) {
        K.execJson(K.tunnel, K.user_timeline + "?screen_name=" + K.screenName + "&callback=" + K.myname + ".readStatusId&count=200&page=" + (++K.page));
        return;
    }
    K.show("");
}

K.readShortURLPrefix = function (obj) {
    if (K.page) {
        var i;
        var m;
	    K.userId = obj[0].user.id;
        for (i = 0; ; i++) {
            if (!obj[i]) break;
            if (obj[i].text.match(/^RT/)) continue;
            if (m = obj[i].text.match(/http:\/\/tumblr\.com\/x([0-9a-z]{2,2})[0-9a-z]+/)) {
                K.shortURLPrefix = m[1];
                break;
            }
        }
    }
    if (!K.shortURLPrefix) {
        K.execJson(K.tunnel, K.user_timeline + "?screen_name=" + K.screenName + "&callback=" + K.myname + ".readShortURLPrefix&count=200&page=" + (++K.page));
        return;
    }
    if (document[K.myname + "_inputform"].detail.checked) {
        K.show("Loading...");
        K.page = 0;
        K.readStatusId(null);
        return;
    }
	K.show("");
}

K.readScreenName = function (obj) {
    if (!obj.tumblelog.name || !obj.posts[0]["reblog-key"]) {
        document.getElementById(K.myname + "_buf").innerHTML = "This URL is not a Tumblr blog...";
        return;
    }
    K.screenName = obj.tumblelog.name;
    K.reblogKey = obj.posts[0]["reblog-key"];
    K.page = 0;
    K.readShortURLPrefix(null);
}

K.result = function () {
    var m = document[K.myname + "_inputform"].url.value.match(/^(http:\/\/.*)\/post\/([0-9]+)/);
    var basename = m[1];
    K.postId = m[2];
    document.getElementById(K.myname + "_buf").innerHTML = "Loading...";
    K.execJson(false, basename + "/api/read/json?callback=" + K.myname + ".readScreenName&id=" + K.postId);
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

})(orangkucing_shorturl);
