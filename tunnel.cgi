#!/usr/bin/perl
use utf8;
use CGI;
$Q = new CGI;
$Q->charset('utf-8');

binmode(STDOUT, ":utf8");

$api = $Q->param('api');
$id = $Q->param('id');
$screen_name = $Q->param('screen_name');
$callback = $Q->param('callback');
$count = $Q->param('count');
$page = $Q->param('page');
print $Q->header(-type=>'text/javascript');

if ($screen_name) {
    open(JS, '-|', 'curl -s -f ' . $api . '?screen_name=' . $screen_name . '\&count=' . $count . '\&page=' . $page);
    $buf = $callback . '(';
    while ($_ = <JS>) {
        $buf .= $_;
    }
    $buf .= ');';
} else {
    open(JS, '-|', 'curl -s -f ' . $api . '?callback=' . $callback . '\&id=' . $id);
    $buf = "";
    while ($_ = <JS>) {
        $buf .= $_;
    }
    $buf = $callback . '();' unless $buf;
}
close(JS);
print $buf;
