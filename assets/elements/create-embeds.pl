#! /usr/bin/perl

####################################################################################
# Take a directory full of inkscape files and combine them into one <defs> section #
####################################################################################

use strict;
use warnings;

my @files = `ls /home/g/scripts/dashboard/images/*.svg`;
my $definitions_filename = '/home/g/scripts/dashboard/images/embeds.txt';

open my $definitions_file, '>', $definitions_filename;
print $definitions_file "<defs>\n";
for my $filename (@files){
  chomp $filename;
  next if $filename eq 'weather-icons.svg';
  next if $filename eq 'all-images.svg';
  next if $filename eq 'all-images-template.svg';
  open (my $file, "<", $filename) or die "opening $filename\n";
  my $found_it = 0;
  while (my $line = <$file>){
    chomp $line;
    last if $line eq '</svg>';
    $line =~ s#inkscape:.+ />#/>#;
    next if $line =~ m!inkscape:!;
    if ($line =~ m# .<g#){
      $found_it = 1;
    }
    next unless $found_it;
    my $label = $filename;
    $label =~ s!.*/!!; #Get rid of the file path
    $label =~ s#\.svg$##;
    #$label =~ s#\-# #g;
    $line =~ s#id=\"layer1\"#id=\"$label\"#;
    $line = darken_colours($line);
    print $definitions_file $line . "\n";
  }

  close $file;
}
print $definitions_file "</defs>\n";
close $definitions_file;

sub darken_colours{
  my $line = shift;
  my $lightest_colour = '#999999';
  $line =~ s!fill:#7eb7e1!fill:$lightest_colour!;
  $line =~ s!fill:#c8c7c7!fill:$lightest_colour!;
  $line =~ s!fill:#d8d8d8!fill:$lightest_colour!;
  $line =~ s!fill:#e7e7e7!fill:$lightest_colour!;
  $line =~ s!fill:#f8d452!fill:$lightest_colour!;
  #$line =~ s!fill:#faea43
  return $line;

  # Thefollowing lines are fine...
  #$line =~ s!fill:#1d1d1d
  #$line =~ s!fill:#2b2b2a
  #$line =~ s!fill:#6ea4d7
}
