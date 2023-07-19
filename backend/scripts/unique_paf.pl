{
	@F=split /\s+/, $_, 13;
	%prop=split /:\S:|\s+/, $F[12];
	($chr,$start,$end) = ($F[5],$F[7],$F[8]);
	if ($prop{"tp"} ne "S"){
		if ($chr eq $last_chr && $start < $last_end){
			if($prop{"AS"}>$last_as){
				$last_=$_;
				($last_chr,$last_start,$last_end) = ($chr,$start,$end);
				$last_as=$prop{"AS"};
			}
		}else{
			print $last_ if $last_;
			$last_=$_;
			($last_chr,$last_start,$last_end) = ($chr,$start,$end);
			$last_as=$prop{"AS"};
		}
	}
}END{
	print $last_;
}
