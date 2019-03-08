# !/usr/bin/perl
# This script fill automatically the JS table.

use strict;
use warnings;
use diagnostics;

my $fd = "../Engine/PapyrusTable.js";

open FD, '>', $fd or die "Error while reading file : $!";

## Permière ligne : var PapyrusTable = [
## Format des lignes : {"Ref" : "1319","RCL" : "fake_data/1319_r_CL.JPG","VCL" : "","RIR" : "","VIR" : ""}
## Dernière ligne : ];
