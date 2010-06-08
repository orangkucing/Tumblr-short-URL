#!/usr/bin/perl
use CGI;
$Q = new CGI;

sub Answer
{
    $screen_name = $Q->param('screen_name');
    $callback = $Q->param('callback');
    $count = $Q->param('count');
    $page = $Q->param('page');
    $url = $Q->param('url');
    print $Q->header( -type => 'text/javascript' );

    open(JS, '-|', 'curl -f ' . $url . '?screen_name=' . $screen_name . '&count=' . $count . '&page=' . $page);
    print $callback . '(';
    while ($_ = <JS>) {
        print $_;
    }
    print ");\n";
    close(JS);

	exit;
}

Answer();
