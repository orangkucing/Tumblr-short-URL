#!/usr/bin/perl
use utf8;
use CGI;
$Q = new CGI;
$Q->charset('utf-8');

binmode(STDOUT, ":utf8");
$api = 'http://www.tumblr.com/statuses/user_timeline.json';

$screen_name = $Q->param('screen_name');
$callback = $Q->param('callback');
$count = $Q->param('count');
$page = $Q->param('page');
print $Q->header(-type=>'text/javascript');

open(JS, '-|', 'curl -f ' . $api . '?screen_name=' . $screen_name . '\&count=' . $count . '\&page=' . $page);
print $callback . '(';
while ($_ = <JS>) {
    print $_;
}
print ");\n";
close(JS);
