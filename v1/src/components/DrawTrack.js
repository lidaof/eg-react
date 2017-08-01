drawTrack_browser(tkobj, tosvg){
/* draw one regular track in browser panel
not for bev or circlet
will draw main canvas and header, but not mcm
to draw a cottontk, must call from cottonbbj (but not target bbj)
*/

var yoffset=0; // reserved for future use

var tc=tkobj.canvas;
var ctx=tc.getContext("2d");

var svgdata=[];
var unitwidth = this.entire.atbplevel ? this.entire.bpwidth : 1;
// set canvas dimension
tc.width=this.entire.spnum;
// height needs to be set for a few cases, otherwise already set when stacking
if(tkobj.ft==FT_matplot || tkobj.ft==FT_qcats) {
	tc.height=tkobj.qtc.height+densitydecorpaddingtop;
} else if(isNumerical(tkobj)) {
	tc.height = tkobj.qtc.height + (tkobj.qtc.height>=20 ? densitydecorpaddingtop : 0);
} else if(tkobj.ft==FT_cat_c || tkobj.ft==FT_cat_n || tkobj.ft==FT_catmat) {
	tc.height=1+tkobj.qtc.height;
} else if(tkobj.ft==FT_catmat) {
}
//retina fix for track
//var oheight = tc.height;
///*
if (window.devicePixelRatio && window.devicePixelRatio != 1){
    var ctxWidth = tc.getAttribute('width');
    var ctxHeight = tc.getAttribute('height');
    var ctxCssWidth = ctxWidth;
    var ctxCssHeight = ctxHeight;
    tc.setAttribute('width',ctxWidth*window.devicePixelRatio);
    tc.setAttribute('height',ctxHeight*window.devicePixelRatio);
    tc.setAttribute('style','width:'+ctxCssWidth+'px;height:'+ctxCssHeight+'px');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    //tc.parentNode.parentNode.setAttribute('style','width:'+ctxCssWidth+'px;height:'+ctxCssHeight+'px');
    //tc.parentNode.setAttribute('style','height:'+ctxCssHeight+'px');
    //tkobj.qtc.height = ctxCssHeight;
}
//*/
ctx.clearRect(0,0,tc.width,tc.height);

if(tkobj.qtc.bg) {
	tc.style.backgroundColor=tkobj.qtc.bg;
	/* error if c is not initialized
	but no trouble as no svg would be made in beginning
	*/
	if(tosvg) svgdata.push({type:svgt_rect,x:0,y:0,w:tc.width,h:tc.height+parseInt(tc.style.paddingBottom),fill:tkobj.qtc.bg});
} else {
	tc.style.backgroundColor='';
}

if(this.weaver) {
	if(this.weaver.iscotton && this.regionLst.length==0) {
		// cottonbbj drawing a cotton tk, but got no regions
		ctx.fillStyle=colorCentral.foreground_faint_5;
		var s=tkobj.label+' - NO MATCH BETWEEN '+this.genome.name+' AND '+this.weaver.target.genome.name+' IN VIEW RANGE';
		var w=ctx.measureText(s).width;
		ctx.fillText(s,(this.hmSpan-w)/2-this.move.styleLeft,tc.height/2+5);
		this.drawTrack_header(tkobj);
		return;
	}
	if(tkobj.ft!=FT_weaver_c) {
		/* paint gap
		gap should only happen in fine mode
		*/
		ctx.fillStyle=gapfillcolor;
		for(var i=0; i<this.regionLst.length; i++) {
			var r=this.regionLst[i];
			var ins=this.weaver.insert[i];
			var fvd= (r[8] && r[8].item.hsp.strand=='-') ? false :true;
			for(var c in ins) {
				ctx.fillRect(
					this.cumoffset(i,parseInt(c)),
					yoffset,
					this.bp2sw(i,ins[c]),
					tc.height);
			}
		}
	}
}
ctx.fillStyle=colorCentral.foreground_faint_1;
ctx.fillRect(0,yoffset,tc.width,1);
yoffset+=1;

if(tkobj.ft==FT_matplot) {
	if(!tkobj.tracks) fatalError('matplot .tracks missing');
	if(tkobj.tracks.length==0) fatalError('matplot empty .tracks');
	/* when matplot y scale has been changed, need to apply to members to take effect!
	*/
	for(var i=0; i<tkobj.tracks.length; i++) {
		var n=tkobj.tracks[i];
		if(typeof(n)=='string') {
			this.tklst.forEach(function(t){
				if(t.name==n) {
					t.mastertk=tkobj;
					tkobj.tracks[i]=t;
				}
			});
		}
		qtc_paramCopy(tkobj.qtc,tkobj.tracks[i].qtc);
	}

	for(var i=0; i<tkobj.tracks.length; i++) {
		var mtk=tkobj.tracks[i];
		if(mtk.qtc.smooth) {
			smooth_tkdata(mtk);
		}
	}
	this.set_tkYscale(tkobj);
	for(var i=0; i<tkobj.tracks.length; i++) {
		var mtk=tkobj.tracks[i];
		var d=this.matplot_drawtk(tkobj,mtk,tosvg);
		if(tosvg) svgdata=svgdata.concat(d);
	}
	if(this.trunk) {
		// this is a splinter, need to plot scale
		var d=plot_ruler({ctx:ctx,
			stop:densitydecorpaddingtop,
			start:densitydecorpaddingtop+tkobj.qtc.height-1,
			xoffset:this.hmSpan-this.move.styleLeft-10,
			horizontal:false,
			color:colorCentral.foreground,
			min:tkobj.minv,
			max:tkobj.maxv,
			extremeonly:true,
			max_offset:-4,
			tosvg:tosvg,
			});
		if(tosvg) svgdata=svgdata.concat(d);
	}
} else if(tkobj.ft==FT_cm_c) {
	var d=this.cmtk_prep_draw(tkobj,tosvg);
	if(tosvg) svgdata=svgdata.concat(d);
} else if(isNumerical(tkobj)) {
	if(tkobj.qtc.smooth) {
		// smoothing may have been done upon no-move update
		if(!tkobj.data_raw) fatalError('data_raw missing');
		smooth_tkdata(tkobj);
	}
	var _d=this.drawTrack_altregiondecor(ctx,tc.height,tosvg);
	if(tosvg) svgdata=svgdata.concat(_d);

	this.set_tkYscale(tkobj);
	var data2= qtrack_logtransform(tkobj.data, tkobj.qtc);
	for(var i=0; i<this.regionLst.length; i++) {
		var r=this.regionLst[i];
		var svd=this.barplot_base({
			data:data2[i],
			ctx:ctx,
			colors:{p:'rgb('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+')',
				n:'rgb('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+')',
				pth:tkobj.qtc.pth,
				nth:tkobj.qtc.nth,
				barbg:tkobj.qtc.barplotbg},
			tk:tkobj,
			rid:i,
			x:this.cumoffset(i,r[3]),
			y:tkobj.qtc.height>=20?densitydecorpaddingtop:0,
			h:tkobj.qtc.height,
			pointup:true,
			tosvg:tosvg});
		if(tosvg) svgdata=svgdata.concat(svd);
		if(tosvg) {
			var _th=tk_height(tkobj);
			var x=this.cumoffset(i,r[4]);
			svgdata.push({type:svgt_line,
				x1:x, y1:0,
				x2:x, y2:_th,
				w:regionSpacing.width,
				color:regionSpacing.color});
		}
	}
	if((this.splinterTag || !this.hmheaderdiv) && tkobj.qtc.height>=20) {
		// splinter tk, draw a in-track scale as its scale is usually different with trunk
		var d=plot_ruler({ctx:ctx,
			stop:densitydecorpaddingtop,
			start:densitydecorpaddingtop+tkobj.qtc.height-1,
			xoffset:this.hmSpan-this.move.styleLeft-10,
			horizontal:false,
			color:colorCentral.foreground,
			min:tkobj.minv,
			max:tkobj.maxv,
			extremeonly:true,
			max_offset:-4,
			tosvg:tosvg,
			scrollable:true, // because scale is on tk canvas, its position subject to adjustment
			});
		if(tosvg) svgdata=svgdata.concat(d);
	}
} else if(tkobj.ft==FT_cat_c || tkobj.ft==FT_cat_n) {
	// consider merge cat to hammock
	for(var i=0; i<this.regionLst.length; i++) {
		var r=this.regionLst[i];
		var bpincrement=this.entire.atbplevel?1:r[7];
		var pastj=0;
		var pastcat=tkobj.data[i][pastj];
		while(pastcat==-1 || !(pastcat in tkobj.cateInfo)) {
			pastj++;
			if(pastj==tkobj.data[i].length) break;
			pastcat=tkobj.data[i][pastj];
		}
		for(var j=pastj+1; j<tkobj.data[i].length; j++) {
			var v = tkobj.data[i][j];
			if(v!=pastcat) {
				if(pastcat!=-1 && (pastcat in tkobj.cateInfo)) {
					var s=this.tkcd_box({
						ctx:ctx,
						rid:i,
						start:r[3]+bpincrement*pastj,
						stop:r[3]+bpincrement*(j),
						y: yoffset,
						h: tkobj.qtc.height,
						fill:tkobj.cateInfo[pastcat][1],
						tosvg:tosvg,
					});
					if(tosvg) svgdata=svgdata.concat(s);
				}
				pastj=j;
				pastcat=v;
			}
		}
		if(pastcat in tkobj.cateInfo) {
			var s=this.tkcd_box({
				ctx:ctx,
				rid:i,
				start:r[3]+bpincrement*pastj,
				stop:r[4],
				y:yoffset,
				h:tkobj.qtc.height,
				fill:tkobj.cateInfo[pastcat][1],
				tosvg:tosvg,
			});
			if(tosvg) svgdata=svgdata.concat(s);
		}
		if(tosvg) {
			var x=this.cumoffset(i,r[4]);
			svgdata.push({type:svgt_line,
				x1:x, y1:yoffset,
				x2:x, y2:yoffset+tkobj.qtc.height,
				w:regionSpacing.width,
				color:regionSpacing.color});
		}
	}
} else if(tkobj.ft==FT_catmat) {
	/* no way to be integrated with cat since cat data is summarized but
	catmat is like stack track with all data, no summary!
	*/
	var _y=yoffset;
	for(var layer=0; layer<tkobj.rowcount; layer++) {
		for(var i=0; i<this.regionLst.length; i++) {
			if(!tkobj.data[i] || tkobj.data[i].length==0) continue;
			var r=this.regionLst[i];
			var pastj=0,
				pastcat=tkobj.data[i][pastj].layers[layer],
				paststart=Math.max(r[3],tkobj.data[i][pastj].start);
			while(pastcat==-1 || !(pastcat in tkobj.cateInfo)) {
				pastj++;
				if(pastj==tkobj.data[i].length) break;
				pastcat=tkobj.data[i][pastj].layers[layer];
				paststart=Math.max(r[3],tkobj.data[i][pastj].start);
			}
			for(var j=pastj+1; j<tkobj.data[i].length; j++) {
				var v = tkobj.data[i][j].layers[layer];
				if(v!=pastcat) {
					if(pastcat!=-1 && (pastcat in tkobj.cateInfo)) {
						// must apply bar width to barplot(), or else damned
						var s=this.tkcd_box({
							ctx:ctx,
							rid:i,
							start:paststart,
							stop:Math.min(r[4],tkobj.data[i][j].start),
							y:_y,
							h:tkobj.rowheight,
							fill:tkobj.cateInfo[pastcat][1],
							tosvg:tosvg,
						});
						if(tosvg) svgdata=svgdata.concat(s);
					}
					pastj=j;
					pastcat=v;
					paststart=Math.max(r[3],tkobj.data[i][j].start);
				}
			}
			if(pastcat in tkobj.cateInfo) {
				var s=this.tkcd_box({
					ctx:ctx,
					rid:i,
					start:paststart,
					stop:Math.min(r[4],tkobj.data[i][tkobj.data[i].length-1].stop),
					y:_y,
					h:tkobj.rowheight,
					fill:tkobj.cateInfo[pastcat][1],
					tosvg:tosvg,
				});
				if(tosvg) svgdata=svgdata.concat(s);
			}
			if(tosvg) {
				var x=this.cumoffset(i,r[4]);
				svgdata.push({type:svgt_line,
					x1:x, y1:_y,
					x2:x, y2:_y+tc.height,
					w:regionSpacing.width,
					color:regionSpacing.color});
			}
		}
		_y+=tkobj.rowheight;
	}
} else if(tkobj.ft==FT_qcats) {
	// set y scale first
	yoffset+=densitydecorpaddingtop;
	var _min=0, _max=0;
	for(var i=this.dspBoundary.vstartr; i<=this.dspBoundary.vstopr; i++) {
		if(!tkobj.data[i] || tkobj.data[i].length==0) continue;
		var r=this.regionLst[i];
		var start=i==this.dspBoundary.vstartr?this.dspBoundary.vstartc:r[3];
		var stop=i==this.dspBoundary.vstopr?this.dspBoundary.vstopc:r[4];
		for(var j=0; j<tkobj.data[i].length; j++) {
			var qcats=tkobj.data[i][j].qcat;
			if(!qcats) continue;
			var __min=0, __max=0;
			for(var k=0; k<qcats.length; k++) {
				var a=qcats[k][0];
				if(a>0) __max+=a;
				else __min+=a;
			}
			// cache y range for each data point
			var __c=__min;
			for(k=0; k<qcats.length; k++) {
				var a=qcats[k][0];
				if(a==0) continue;
				qcats[k][2]=a<0?__c-a:__c+a;
				__c=qcats[k][2];
			}
			if(Math.max(tkobj.data[i][j].start,start)<Math.min(tkobj.data[i][j].stop,stop)) {
				_min=Math.min(_min,__min);
				_max=Math.max(_max,__max);
			}
		}
	}
	tkobj.minv=_min;
	tkobj.maxv=_max;
	// plot data
	for(var i=this.dspBoundary.vstartr; i<=this.dspBoundary.vstopr; i++) {
		if(!tkobj.data[i] || tkobj.data[i].length==0) continue;
		var r=this.regionLst[i];
		for(var j=0; j<tkobj.data[i].length; j++) {
			var qcats=tkobj.data[i][j].qcat;
			if(!qcats) continue;
			for(var k=0; k<qcats.length; k++) {
				var v=qcats[k][0];
				if(v==0) continue;
				// must apply bar width to barplot(), or else damned
				var _y=yoffset+tkobj.qtc.height*(_max-qcats[k][2])/(_max-_min);
				var _h=tkobj.qtc.height*Math.abs(v)/(_max-_min);
				var s=this.tkcd_box({
					ctx:ctx,
					rid:i,
					start:tkobj.data[i][j].start,
					stop:tkobj.data[i][j].stop,
					y: _y,
					h: _h,
					fill:tkobj.cateInfo[qcats[k][1]][1],
					tosvg:tosvg,
				});
				qcats[k][3]=_y;
				qcats[k][4]=_h;
				if(tosvg) svgdata=svgdata.concat(s);
			}
		}
		if(tosvg) {
			var x=this.cumoffset(i,r[4]);
			svgdata.push({type:svgt_line,
				x1:x, y1:yoffset,
				x2:x, y2:yoffset+tc.height,
				w:regionSpacing.width,
				color:regionSpacing.color});
		}
	}
} else {
	/* stack/bar/arc/trihm/weaver
	*/
	if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
		this.regionLst=this.decoy_dsp.regionLst;
		this.dspBoundary=this.decoy_dsp.dspBoundary;
	} else if(tkobj.ft==FT_weaver_c) {
		if(!this.weaver) fatalError('but browser.weaver is unknown');
	}

	if(tkobj.qtc) {
		ctx.font = (tkobj.qtc.fontbold?'bold':'')+' '+
			(tkobj.qtc.fontsize?tkobj.qtc.fontsize:'8pt')+' '+
			(tkobj.qtc.fontfamily?tkobj.qtc.fontfamily:'sans-serif');
	}

	var drawTriheatmap = tkobj.mode==M_trihm;
	var drawArc = tkobj.mode==M_arc;
	var isSam = (tkobj.ft==FT_bam_c||tkobj.ft==FT_bam_n);
	var isChiapet = (tkobj.ft==FT_lr_n||tkobj.ft==FT_lr_c||tkobj.ft==FT_hi_c);

	var isThin = tkobj.mode==M_thin;
	var stackHeight = tkobj.qtc.stackheight?tkobj.qtc.stackheight : (isThin ? thinStackHeight : fullStackHeight);

	var startRidx=0,stopRidx=this.regionLst.length-1,
		startViewCoord=this.dspBoundary.vstartc,
		stopViewCoord=this.dspBoundary.vstopc;
	if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		startRidx=this.dspBoundary.vstartr;
		stopRidx=this.dspBoundary.vstopr;
	}

	var Data=tkobj.data;
	var Data2=tkobj.data_chiapet;
	if(isChiapet && (!drawArc && !drawTriheatmap)) Data=Data2;

	var old_yoffset=yoffset;

	var i,j;

	var _d=this.drawTrack_altregiondecor(ctx,tc.height,tosvg);
	if(tosvg) svgdata=svgdata.concat(_d);

	if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		// leave space for snp
		yoffset+=tkobj.ld.ticksize+tkobj.ld.topheight;
	}

	var vstartRidx=this.dspBoundary.vstartr,
		vstopRidx=this.dspBoundary.vstopr;

	/* score-graded tk items: lr, ld, hammock
	*/
	var pcolorscore=ncolorscore= // lr
		colorscore_min=colorscore_max=null; // hammock
	if(tkobj.ft==FT_lr_c||tkobj.ft==FT_lr_n||tkobj.ft==FT_hi_c) {
		pcolorscore=tkobj.qtc.pcolorscore;
		ncolorscore=tkobj.qtc.ncolorscore;
		if(tkobj.qtc.thtype==scale_auto) {
			var s_max=s_min=0;
			for(var i=vstartRidx; i<=vstopRidx; i++) {
				if(drawArc||drawTriheatmap) {
					for(var j=0; j<Data2[i].length; j++) {
						var item = Data2[i][j];
						if(item.boxstart==undefined || item.boxwidth==undefined) continue;
						if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
						var s=item.name;
						if(s>0 && s>s_max) s_max=s;
						else if(s<0 && s<s_min) s_min=s;
					}
				} else {
					for(var j=0; j<Data[i].length; j++) {
						var item = Data[i][j];
						if(item.boxstart==undefined || item.boxwidth==undefined) continue;
						if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
						var s;
						if(item.struct) {
							s=item.name;
						} else {
							// unmatched
							s=parseInt(item.name.split(',')[1]);
						}
						if(s>0 && s>s_max) s_max=s;
						else if(s<0 && s<s_min) s_min=s;
					}
				}
			}
			pcolorscore=tkobj.qtc.pcolorscore=s_max;
			ncolorscore=tkobj.qtc.ncolorscore=s_min;
		}
	} else if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
		if(tkobj.showscoreidx>=0) {
			var scale=tkobj.scorescalelst[tkobj.showscoreidx];
			if(scale.type==scale_auto) {
				var s_max=s_min=0;
				for(var i=vstartRidx; i<=vstopRidx; i++) {
					for(var j=0; j<Data2[i].length; j++) {
						var item = Data2[i][j];
						if(item.boxstart==undefined || item.boxwidth==undefined) continue;
						if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
						var s=item.name;
						if(s>0 && s>s_max) s_max=s;
						else if(s<0 && s<s_min) s_min=s;
					}
				}
				pcolorscore=tkobj.qtc.pcolorscore=s_max;
				ncolorscore=tkobj.qtc.ncolorscore=s_min;
			} else {
				pcolorscore=tkobj.qtc.pcolorscore=scale.max;
				ncolorscore=tkobj.qtc.ncolorscore=scale.min;
			}
		} else {
		}
	} else if(tkobj.showscoreidx!=undefined && tkobj.showscoreidx>=0) {
		// hammock
		this.set_tkYscale(tkobj);
		colorscore_min=tkobj.minv;
		colorscore_max=tkobj.maxv;
	}

	// in case of drawing trihm in main panel, will measure highest dome within dsp to set track height
	var canvasstart=0-this.move.styleLeft;
	var canvasstop=canvasstart+this.hmSpan;
	var viewrangeblank=true; // if any item is drawn within view range
	if(drawArc) {
		var arcdata = [];
		/* store arc data for clicking on canvas
		each ele is for one arc/pair:
		[center x, center y, radius, region idx, array idx]
		canvas yoffset must be subtracted
		*/
		for(i=startRidx; i<=stopRidx; i++) {
			if(!Data2[i]) continue;
			for(var j=0; j<Data2[i].length; j++) {
				var item = Data2[i][j];
				if(!item.struct || item.boxstart==undefined || item.boxwidth==undefined) continue;
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				// TODO replace pcolorscore with tkobj.maxv/.minv
				var color= (item.name >= 0) ?
					'rgba('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+','+Math.min(1,item.name/pcolorscore)+')' :
					'rgba('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+','+Math.min(1,item.name/ncolorscore)+')';

				var centerx = item.boxstart+item.boxwidth/2;
				var centery = yoffset-item.boxwidth/2;
				var arcwidth=1; // TODO arc width auto-adjust
				var radius = Math.max(0,item.boxwidth/Math.SQRT2-arcwidth/2);
				ctx.strokeStyle = color;
				ctx.lineWidth=arcwidth;
				ctx.beginPath();
				ctx.arc(centerx, centery, radius, 0.25*Math.PI, 0.75*Math.PI, false);
				ctx.stroke();
				arcdata.push([centerx, centery, radius, i, j, arcwidth]);
				if(tosvg) {
					svgdata.push({type:svgt_arc,radius:radius,
						x1:item.boxstart,y1:0,
						x2:item.boxstart+item.boxwidth,y2:0,
						color:color});
				}
			}
		}
		tkobj.data_arc = arcdata;
	} else if(drawTriheatmap) {
		// canvas yoffset must be subtracted
		var hmdata = []; // for mouse click detection
		for(i=startRidx; i<=stopRidx; i++) {
			if(!(Data2[i])) continue;
			for(var j=0; j<Data2[i].length; j++) {
				var item = Data2[i][j];
				if(!item.struct || item.boxstart==undefined || item.boxwidth==undefined) continue;
				if(item.boxstart<0) continue;
				if(item.boxwidth>=this.hmSpan*2) {
					/*** if the loci spans over 2 hmspan on canvas, skip
					***/
					continue;
				}
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}

				/* horizontal width of two mates
				the width is used as horizontal side of a isosceles
				*/
				// left
				var e = item.struct.L;
				var _r=this.regionLst[e.rid];
				var leftw = Math.max(this.cumoffset(e.rid,Math.min(_r[4],e.stop))-this.cumoffset(e.rid,Math.max(_r[3],e.start)),2);
				// right
				e = item.struct.R;
				_r=this.regionLst[e.rid];
				var rightw = Math.max(this.cumoffset(e.rid,Math.min(_r[4],e.stop))-this.cumoffset(e.rid,Math.max(_r[3],e.start)),2);
				var color= (item.name>= 0) ?
					'rgba('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+','+Math.min(1,item.name/pcolorscore)+')' :
					'rgba('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+','+Math.min(1,item.name/ncolorscore)+')';
				// top corner point position
				var _tan=Math.tan(tkobj.qtc.anglescale*Math.PI/4);
				var top_x = item.boxstart+item.boxwidth/2;
				var top_y = yoffset+item.boxwidth*_tan/2;
				ctx.fillStyle = color;
				ctx.beginPath();
				/*		p3
					p4		p2
						p1
				*/
				var a1=top_x,
					b1=top_y,
					a2=top_x+leftw/2,
					b2=top_y-leftw*_tan/2
					a3=top_x+leftw/2-rightw/2,
					b3=top_y-leftw*_tan/2-rightw*_tan/2,
					a4=top_x-rightw/2,
					b4=top_y-rightw*_tan/2;
				ctx.moveTo(a1,b1);
				ctx.lineTo(a2,b2);
				ctx.lineTo(a3,b3);
				ctx.lineTo(a4,b4);
				ctx.closePath();
				ctx.fill();
				hmdata.push([top_x, top_y, leftw, rightw, i, j]);
				if(tosvg) {
					svgdata.push({type:svgt_trihm,
						x1:a1,y1:b1,
						x2:a2,y2:b2,
						x3:a3,y3:b3,
						x4:a4,y4:b4,
						color:color});
				}
			}
		}
		tkobj.data_trihm = hmdata;
	} else if(tkobj.mode==M_bar) {
		/***** hammock barplot
		*/
		var y0=densitydecorpaddingtop+tkobj.qtc.height+1+yoffset;
		var bedcolor=tkobj.qtc.bedcolor,
			textcolor=tkobj.qtc.textcolor;
		var bedcolorlst=colorstr2int(bedcolor).join(','),
			textcolorlst=colorstr2int(textcolor).join(',');
		for(i=startRidx; i<=stopRidx; i++) {
			var r = this.regionLst[i];
			if(Data[i]==undefined) {
				continue;
			}
			var regionstart = r[3];
			var regionstop = r[4];
			for(var j=0; j<Data[i].length; j++) {
				var item = Data[i][j];
				if(item.boxstart==undefined || !item.boxwidth) continue;
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				// may category-specific style
				if(item.category!=undefined && tkobj.cateInfo && (item.category in tkobj.cateInfo)) {
					// apply category color
					textcolor=bedcolor=tkobj.cateInfo[item.category][1];
					bedcolorlst=colorstr2int(bedcolor).join(',');
				}
				// item
				var a=y0+item.stack*(fullStackHeight+1);
				var _d=this.tkcd_item({
					item:item,
					ctx:ctx,
					stackHeight:fullStackHeight,
					y:a,
					tkobj:tkobj,
					bedcolor:bedcolor,
					textcolor:textcolor,
					region_idx:i,
					tosvg:tosvg,
					});
				if(tosvg) svgdata=svgdata.concat(_d);
				// bar
				var score=Infinity;
				var thiscolor=bedcolorlst;
				if(item.scorelst && tkobj.showscoreidx!=undefined && tkobj.showscoreidx!=-1) {
					score=item.scorelst[tkobj.showscoreidx];
				}
				_d=this.barplot_uniform({
					score:score,
					ctx:ctx,
					colors:{p:'rgba('+thiscolor+',.6)',
						n:'rgba('+thiscolor+',.6)',
						},
					tk:tkobj,
					rid:i,
					y:densitydecorpaddingtop,
					h:tkobj.qtc.height,
					pointup:true,
					tosvg:tosvg,
					start:Math.max(r[3],item.start),
					stop:Math.min(r[4],item.stop)});
				if(tosvg) svgdata=svgdata.concat(_d);
			}
		}
		if(!viewrangeblank && (this.splinterTag || !this.hmheaderdiv)) {
			// scale
			var d=plot_ruler({ctx:ctx,
				stop:densitydecorpaddingtop,
				start:y0-2,
				xoffset:this.hmSpan-this.move.styleLeft-10,
				horizontal:false,
				color:colorCentral.foreground,
				min:colorscore_min,
				max:colorscore_max,
				extremeonly:true,
				max_offset:-4,
				tosvg:tosvg,
				scrollable:true, // because scale is on tk canvas, its position subject to adjustment
				});
			if(tosvg) svgdata=svgdata.concat(d);
		}
	} else if(tkobj.ft==FT_weaver_c && tkobj.weaver.mode==W_rough) {
		// stitched hsp
		/* rank stitch by combined length:
		  sum of target length of all hsp pieces
		  entire span of query
		*/
		var srank=[];
		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			var a=tkobj.weaver.stitch[i];
			var c=0;
			for(var j=0; j<a.lst.length; j++) {
				c+=a.lst[j].targetstop-a.lst[j].targetstart;
			}
			srank.push([c,i,c+a.stop-a.start]);
		}
		srank.sort(function(m,n){return n[2]-m[2];});
		var xspacer=5;
		var blob=[];
		// go over all stitches
		for(var i=0; i<srank.length; i++) {
			var stp=tkobj.weaver.stitch[srank[i][1]];
			var targetx1=9999,targetx2=0;
			for(var j=0; j<stp.lst.length; j++) {
				targetx1=Math.min(targetx1,stp.lst[j].t1);
				targetx2=Math.max(targetx2,stp.lst[j].t2);
			}
			var stpw=(stp.stop-stp.start)/this.entire.summarySize; // stitch width on canvas
			// ideal stitch position
			stp.canvasstart=(targetx1+targetx2)/2-stpw/2;
			stp.canvasstop=Math.min(stp.canvasstart+stpw,this.entire.spnum);

			// 1: horizontal shift to fit unbalanced hsp distribution on target
			var mc=srank[i][0]; // mid target coord (adding up)
			var x0=stp.t1,x9=stp.t2;
			if(stpw>x9-x0) {
				// stitch on screen width wider than target, no shifting
			} else {
				mc/=2;
				var midx0=(x9+x0)/2;
				// find middle point of all hsp on canvas
				var add=0;
				var midx=-1;
				for(j=0; j<stp.lst.length; j++) {
					var h=stp.lst[j];
					if(mc>=add && mc<=add+h.targetstop-h.targetstart) {
						midx=this.cumoffset(h.targetrid, h.targetstart+mc-add);
						break;
					}
					add+=h.targetstop-h.targetstart;
				}
				if(midx>midx0) {
					// shift to right
					stp.canvasstop = Math.min(x9, stp.canvasstop+midx-midx0);
					stp.canvasstart=stp.canvasstop-stpw;
				} else {
					stp.canvasstart = Math.max(x0, stp.canvasstart-(midx0-midx));
					stp.canvasstop=stp.canvasstart+stpw;
				}
			}

			// 2: find a slot to put this one and look through previously placed stitches
			var nohit=true;
			for(var j=0; j<blob.length; j++) {
				if(Math.max(blob[j][0],stp.canvasstart)<Math.min(blob[j][1],stp.canvasstop)) {
					// hit one
					nohit=false;
					if(stp.canvasstart+stp.canvasstop < blob[j][0]+blob[j][1]) {
						// new one is towards blob's left
						if(blob[j][0]<stpw+xspacer-this.move.styleLeft) {
							// no space on left
							stitchblob_insertright(blob,j,stp,stpw,xspacer);
						} else {
							var succ=stitchblob_insertleft(blob,j,stp,stpw,xspacer);
							if(!succ) {
								stitchblob_insertright(blob,j,stp,stpw,xspacer);
							}
						}
					} else {
						stitchblob_insertright(blob,j,stp,stpw,xspacer);
					}
				}
			}
			if(nohit) {
				// no hit to blob
				stitchblob_new(blob,stp);
			}
		}

		/* try to fit the last stitch all inside view range
		so that a flipped query region with items on its tail can be seen joining with the previous query region
		(as of fusion gene)
		if(tkobj.weaver.stitch.length>0) {
			var stch=tkobj.weaver.stitch[tkobj.weaver.stitch.length-1];
			if(stch.canvasstart<this.hmSpan-this.move.styleLeft) {
				stch.canvasstop=Math.min(stch.canvasstop,this.entire.spnum);
			}
		}
		*/

		// shrink and shift if any stitch is outside viewrange
		var outvr=false;
		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			var a=tkobj.weaver.stitch[i];
			if(a.canvasstart<-this.move.styleLeft || a.canvasstop>this.hmSpan-this.move.styleLeft) {
				outvr=true;
				break;
			}
		}
		if(outvr) {
			var minx=9999, maxx=0; // min/max x pos of all stitches
		}

		var stitchbarh=10;
		var y2=tc.height-11;

		// rank stitch again by xpos
		srank=[];
		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			srank.push([tkobj.weaver.stitch[i].canvasstart,i]);
		}
		srank.sort(function(m,n){return m[0]-n[0];});
		var newlst=[];
		for(var i=0; i<srank.length; i++) {
			newlst.push(tkobj.weaver.stitch[srank[i][1]]);
		}
		tkobj.weaver.stitch=newlst;

		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			var stp=tkobj.weaver.stitch[i];
			viewrangeblank=false;
			ctx.clearRect(stp.canvasstart-xspacer,y2,stp.canvasstart+300,20);
			// query bar
			var clst=colorstr2int(tkobj.qtc.bedcolor);
			ctx.fillStyle=lightencolor(clst,.8);
			var a=stp.canvasstop-stp.canvasstart;
			ctx.fillRect(stp.canvasstart,y2,a,stitchbarh);
			if(tosvg) svgdata.push({type:svgt_rect,x:stp.canvasstart,y:y2,w:a,h:stitchbarh,fill:ctx.fillStyle});
			// query coord
			var a=stp.chr+':'+stp.start+'-'+stp.stop+', '+bp2neatstr(stp.stop-stp.start);
			var w=ctx.measureText(a).width;
			ctx.fillStyle=tkobj.qtc.bedcolor;
			var b=Math.max(stp.canvasstart,(stp.canvasstart+stp.canvasstop-w)/2);
			ctx.fillText(a,b,tc.height-1);
			if(w<stp.canvasstop-stp.canvasstart) {
				if(tosvg) svgdata.push({type:svgt_text,x:b,y:tc.height-1,text:a,color:ctx.fillStyle});
			}
			// hsps
			var sf=(stp.canvasstop-stp.canvasstart)/(stp.stop-stp.start); // px / bp on stitch
			for(var j=0; j<stp.lst.length; j++) {
				var y3=y2-1;
				var hsp=stp.lst[j];
				var t1=hsp.t1;
				var t2=hsp.t2;
				var q1=stp.canvasstart+sf*((hsp.strand=='+'?hsp.querystart:hsp.querystop)-stp.start);
				var q2=stp.canvasstart+sf*((hsp.strand=='+'?hsp.querystop:hsp.querystart)-stp.start);
				hsp.q1=q1;
				hsp.q2=q2;

				ctx.fillStyle=weavertkcolor_target;
				ctx.fillRect(t1,yoffset,Math.max(1,t2-t1),1);
				if(tosvg) svgdata.push({type:svgt_line,x1:t1,y1:yoffset+.5,x2:t2,y2:yoffset+.5,w:1,color:ctx.fillStyle});
				ctx.fillStyle=tkobj.qtc.bedcolor;
				if(hsp.strand=='+') {
					ctx.fillRect(q1,y3, Math.max(1, q2-q1), 1);
				} else {
					ctx.fillRect(q2,y3, Math.max(1, q1-q2), 1);
				}
				if(tosvg) svgdata.push({type:svgt_line,x1:q1,y1:y3-.5,x2:q2,y2:y3-.5,w:1,color:ctx.fillStyle});
				// thinner the band, darker the color
				var op=0.3;
				if(t2-t1<1) {
					op=0.5;
				} else if(t2-t1<5) {
					op=0.3+(5-t2+t1)*0.2/5;
				}
				ctx.fillStyle='rgba('+clst+','+op.toFixed(2)+')';
				ctx.beginPath();
				ctx.moveTo(t1,yoffset+1);
				ctx.lineTo(t2-t1<1?t1+1:t2,yoffset+1);
				ctx.lineTo(Math.abs(q2-q1)<1?q1+1:q2,y3);
				ctx.lineTo(q1,y3);
				ctx.closePath();
				ctx.fill();
				if(tosvg) svgdata.push({type:svgt_polygon,points:[[t1,yoffset+1],[t2,yoffset+1],[q2,y3],[q1,y3]],fill:ctx.fillStyle});
			}
		}
		this.weaver_stitch2cotton(tkobj);
	} else {
		/** stack **/
		if(tkobj.ft==FT_weaver_c) {
			if(tkobj.weaver.mode!=W_fine) fatalError('weavertk supposed to be in fine mode');
			this.weaver_hsp2cotton(tkobj);
		}
		var bedcolor, textcolor, bedcolorlst, textcolorlst,
			fcolor, rcolor, mcolor;
		if(isSam) {
			fcolor = tkobj.qtc.forwardcolor;
			rcolor = tkobj.qtc.reversecolor;
			mcolor = tkobj.qtc.mismatchcolor;
		} else if(isChiapet) {
			// include lr and ld
			textcolor=tkobj.qtc.textcolor;
			textcolorlst=colorstr2int(textcolor).join(',');
			// cannot use bedcolor as it use different color for +/- score
		} else {
			bedcolor=tkobj.qtc.bedcolor;
			textcolor=tkobj.qtc.textcolor;
			bedcolorlst=colorstr2int(bedcolor).join(',');
			if(!textcolor) {
				// not given in weavertk
				textcolor=colorCentral.foreground;
			}
			textcolorlst=colorstr2int(textcolor).join(',');
		}
		var hspdiststrx=0; // for weaver fine hsp
		for(i=startRidx; i<=stopRidx; i++) {
			var r = this.regionLst[i];
			if(Data[i]==undefined) {
				continue;
			}
			var regionstart = r[3];
			var regionstop = r[4];
			for(var j=0; j<Data[i].length; j++) {
				if(Data[i][j].stack == undefined) {
					continue;
				}
				var item = Data[i][j];
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				// plotting will be curbed by start/stop of both item and region
				var curbstart = Math.max(regionstart, item.start);
				var curbstop = Math.min(regionstop, item.stop);

				var y = yoffset + item.stack*( stackHeight +1 );

				if(tkobj.ft==FT_weaver_c) {
					// fine hsp
					var _d=this.tkcd_item({item:item,
						ctx:ctx,
						y:y+1+weavertkpad,
						tkobj:tkobj,
						region_idx:i,
						tosvg:tosvg,
						});
					if(tosvg) svgdata=svgdata.concat(_d);
					var phs=null; // previous hsp
					if(j>0) {
						phs=Data[i][j-1].hsp;
					} else if(i>0) {
						var bi=i-1;
						while(bi>=0) {
							if(Data[bi].length>0) {
								phs=Data[bi][Data[bi].length-1];
								break;
							}
							bi--;
						}
					}
					if(!phs) continue;
					// target dist
					var s=bp2neatstr(item.hsp.targetstart-phs.targetstop);
					var w=ctx.measureText(s).width;
					var cspace=item.hsp.canvasstart-phs.canvasstop;
					if(w+6<cspace) {
						ctx.fillStyle=weavertkcolor_target;
						var x=(item.hsp.canvasstart+phs.canvasstop-w)/2,
							y2=y+weavertkpad+10;
						ctx.fillText(s,x,y2);
						if(tosvg) svgdata.push({type:svgt_text,x:x,y:y2,text:s,color:ctx.fillStyle});
					}
					// query dist
					ctx.fillStyle=tkobj.qtc.bedcolor;
					var s;
					if(phs.querychr==item.hsp.querychr) {
						if(Math.max(phs.querystart,item.hsp.querystart)<Math.min(phs.querystop,item.hsp.querystop)) {
							s='overlap';
						} else {
							var dist= phs.querystop == item.hsp.querystart ? 0 :
								(phs.querystop < item.hsp.querystart ?
								(item.hsp.querystart-phs.querystop) :
								(phs.querystart-item.hsp.querystop));
							s=bp2neatstr(dist);
						}
					} else {
						s='not connected';
					}
					var w=ctx.measureText(s).width;
					var y2=y+weavertkpad+(item.stack+1)*tkobj.qtc.stackheight;
					var x=(item.hsp.canvasstart+phs.canvasstop-w)/2;
					if(w+6<cspace) {
						ctx.fillText(s,x,y2);
						if(tosvg) svgdata.push({type:svgt_text,x:x,y:y2,text:s,color:ctx.fillStyle});
					} else {
						// underneath
						ctx.strokeStyle=tkobj.qtc.bedcolor;
						ctx.beginPath();
						var b=y2+weavertk_hspdist_strpad;
						if(x-10>hspdiststrx) {
							var a=phs.canvasstop;
							ctx.moveTo(a,y2);
							ctx.lineTo(a-3,b);
							if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:y2,x2:a-3,y2:b,w:1,color:ctx.strokeStyle});
							a=item.hsp.canvasstart;
							ctx.moveTo(a,y2);
							ctx.lineTo(a+3,y2+weavertk_hspdist_strpad);
							ctx.stroke();
							if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:y2,x2:a+3,y2:b,w:1,color:ctx.strokeStyle});
						} else {
							x=hspdiststrx+10;
							var x2=(phs.canvasstop+item.hsp.canvasstart)/2;
							ctx.moveTo(x2,y2);
							ctx.lineTo(x+w/2,b);
							ctx.stroke();
							if(tosvg) svgdata.push({type:svgt_line,x1:x2,y1:y2,x2:x+w/2,y2:b,w:1,color:ctx.strokeStyle});
						}
						hspdiststrx=x+w+3;
						var y3=y2+weavertk_hspdist_strpad+weavertk_hspdist_strh;
						ctx.fillText(s,x,y3);
						if(tosvg) svgdata.push({type:svgt_text,x:x,y:y3,text:s,color:ctx.fillStyle});
					}
					continue;
				}

				if(isSam) {
					/**************
						bam read
					 **************/
					if(item.hasmate) {
						/** paired read **/
						var rd1=item.struct.L;
						var rd2=item.struct.R;
						var _s=this.plotSamread(ctx,
							rd1.rid,
							rd1.start,
							rd1.bam,
							y,
							stackHeight,
							rd1.strand=='>'?fcolor:rcolor,
							mcolor,
							tosvg);
						if(tosvg) svgdata=svgdata.concat(_s);
						var _s=this.plotSamread(ctx,
							rd2.rid,
							rd2.start,
							rd2.bam,
							y,
							stackHeight,
							rd2.strand=='>'?fcolor:rcolor,
							mcolor,
							tosvg);
						if(tosvg) svgdata=svgdata.concat(_s);

						// line joining the pair
						var linestart,linestop;
						if(rd1.rid==rd2.rid) {
							linestart=this.cumoffset(i,Math.min(rd1.stop,rd2.stop));
							linestop=this.cumoffset(i,Math.max(rd1.start,rd2.start));
						} else {
							var fvd=(r[8] && r[8].item.hsp.strand=='-')?false:true;
							linestart=this.cumoffset(i, fvd ?
								Math.min(r[4],rd1.stop) : Math.max(r[3],rd1.start));
							var r2=this.regionLst[rd2.rid];
							fvd=(r2[8] && r2[8].item.hsp.strand=='-')?false:true;
							linestop=this.cumoffset(rd2.rid, fvd ?
								Math.max(r2[3],rd2.start) : Math.min(r2[4],rd2.stop));
						}
						if(linestart>=0 && linestop>=0) {
							var y2 = (isThin ? y : y+4)+.5;
							ctx.strokeStyle = colorCentral.foreground_faint_5;
							ctx.lineWidth=1;
							ctx.moveTo(linestart,y2);
							ctx.lineTo(linestop,y2);
							ctx.stroke();
							if(tosvg) svgdata.push({type:svgt_line, x1:linestart,y1:y2, x2:linestop, y2:y2, w:1, color:ctx.fillStyle});
						}
						continue;
					}
					/** single read **/
					var _s=this.plotSamread(ctx,
						i,
						item.start,
						item.bam,
						y,
						stackHeight,
						item.strand=='>'?fcolor:rcolor,
						mcolor,
						tosvg);
					if(tosvg) svgdata=svgdata.concat(_s);
					continue;
				}

				// figure out box/text color for this item
				if(isChiapet) {
					/* if has mate, .name is score
					else, name is coord plus score, joined by comma
					*/
					var thisscore = (item.struct) ? item.name : parseFloat(item.name.split(',')[1]);
					bedcolor= (thisscore>= 0) ?
						'rgba('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+','+Math.min(1,thisscore/pcolorscore)+')' :
						'rgba('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+','+Math.min(1,thisscore/ncolorscore)+')';
					textcolor= (thisscore>= 0) ?
						'rgba('+textcolorlst+','+Math.min(1,thisscore/pcolorscore)+')' :
						'rgba('+textcolorlst+','+Math.min(1,thisscore/ncolorscore)+')';
				} else {
					if(item.category!=undefined && tkobj.cateInfo && (item.category in tkobj.cateInfo)) {
						textcolor=bedcolor=tkobj.cateInfo[item.category][1];
						bedcolorlst=colorstr2int(bedcolor).join(',');
						textcolorlst=colorstr2int(textcolor).join(',');
					}
					if(item.scorelst && tkobj.showscoreidx!=undefined && tkobj.showscoreidx>=0) {
						// here it allows an item to be not having score data!
						var _rv=tkobj.maxv-tkobj.minv;
						var thisscore=item.scorelst[tkobj.showscoreidx];
						textcolor= 'rgba('+textcolorlst+','+Math.min(1,(thisscore-tkobj.minv)/_rv)+')';
						bedcolor= 'rgba('+bedcolorlst+','+Math.min(1,(thisscore-tkobj.minv)/_rv)+')';
					}
//leepc12_hotfix for bed color strand
                                        if(tkobj.ft==FT_bed_c||tkobj.ft==FT_bigbed_c) {
                                                ctx.font='0pt Sans-serif';
                                                if ( item.strand=='+'||item.strand=='>')
                                                        bedcolor='#FF0000';//'#800000'; // maroon
                                                if ( item.strand=='-'||item.strand=='<')
                                                        bedcolor='#0000FF';//'#0000A0'; // dark blue
                                        }
//leepc12
				}

				if(isThin) {
					/***  thin  TODO thin/full merge ***/
					var _d=this.tkcd_box({
						ctx:ctx,
						rid:i,
						start:item.start,
						stop:item.stop,
		viziblebox:true,
						y:y,
						h:stackHeight,
						fill:bedcolor,
						tosvg:tosvg,
					});
					if(tosvg) svgdata=svgdata.concat(_d);
				} else {
					/* full mode */
					var _d=this.tkcd_item({item:item,
						ctx:ctx,
						stackHeight:stackHeight,
						y:y,
						tkobj:tkobj,
						bedcolor:bedcolor,
						textcolor:textcolor,
						isChiapet:isChiapet,
						region_idx:i,
						tosvg:tosvg,
						});
					if(tosvg) svgdata=svgdata.concat(_d);
				}
			}
		}
		if(tkobj.ft==FT_weaver_c) {
			// done fiddling with hsp
			if(tkobj.weaver.mode!=W_fine) fatalError('weavertk supposed to be in fine mode');
			var cbj= this.weaver.q[tkobj.cotton];
			if(cbj.tklst.length>0 || cbj.init_bbj_param) {
				for(var a=0; a<cbj.regionLst.length; a++) {
					var b=cbj.regionLst[a];
					b[8].canvasxoffset=b[8].item.hsp.canvasstart;
				}
				this.weaver_cotton_spin(cbj);
			}
		}
	}
	if(viewrangeblank) {
                if (tkobj.ft==FT_hi_c){
                    //tc.height = 80;
                    print2console('NO DATA IN VIEW RANGE, please change configurations',2);
                    var m = 'current configuration:';
                    print2console(m,2);
                    m = ' matrix: '+tkobj.qtc.matrix;
                    print2console(m,2);
                    m = ' norm: '+tkobj.qtc.norm;
                    print2console(m,2);
                    m = ' unit: '+tkobj.qtc.unit_res;
                    print2console(m,2);
                    if (tkobj.qtc.bin_size == 0){
                        m = ' bin:(auto) '+prettyBinSize(tkobj.qtc.d_binsize);
                    }else{
                        m = ' bin: '+prettyBinSize(tkobj.qtc.d_binsize);
                    }
                    print2console(m,2);
                }
                //}else{
	            ctx.fillStyle=colorCentral.foreground_faint_5;
                    var s=tkobj.label+' - NO DATA IN VIEW RANGE';
    	            var w=ctx.measureText(s).width;
                    var x = (this.hmSpan-w)/2-this.move.styleLeft;
                    var y = tc.height/2+5;
        	    ctx.fillText(s,x,y);
                //}
                    /*
                if (tkobj.ft==FT_hi_c){
                    //tc.height = 80;
                    //not working!!!
                    var m = 'current configuration:';
                    y+=12;
		    ctx.fillText(m,x,y);
                    m = ' matrix: '+tkobj.qtc.matrix;
                    y+=12;
		    ctx.fillText(m,x,y);
                    m = ' norm: '+tkobj.qtc.norm;
                    y+=12;
		    ctx.fillText(m,x,y);
                    m = ' unit: '+tkobj.qtc.unit_res;
                    y+=12;
		    ctx.fillText(m,x,y);
                    if (tkobj.qtc.bin_size == 0){
                        m = ' bin:(auto) '+prettyBinSize(tkobj.qtc.d_binsize);
                    }else{
                        m = ' bin: '+prettyBinSize(tkobj.qtc.d_binsize);
                    }
                    y+=12;
		    ctx.fillText(m,x,y);
                }
                    */
	} else if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		// plot snps from the LD track
		yoffset=old_yoffset;
		ctx.strokeStyle=colorCentral.foreground;
		ctx.beginPath();
		var a=yoffset+tkobj.ld.ticksize+.5;
		ctx.moveTo(0,a);
		ctx.lineTo(tc.width,a);
		if(tosvg) svgdata.push({type:svgt_line,x1:0,y1:a,x2:tc.width,y2:a,color:ctx.strokeStyle});
		for(var n in tkobj.ld.hash) {
			var rs=tkobj.ld.hash[n];
			var a=rs.topx,
				b=yoffset,
				c=yoffset+tkobj.ld.ticksize,
				d=rs.bottomx,
				e=yoffset+tkobj.ld.ticksize+tkobj.ld.topheight;
			// tick
			ctx.moveTo(a,b);
			ctx.lineTo(a,c);
			if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:b,x2:a,y2:c,color:ctx.strokeStyle});
			// link
			ctx.lineTo(d,e);
			if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:c,x2:d,y2:e,color:ctx.strokeStyle});
		}
		ctx.stroke();
	}

	/* always redraw .atC
	as the .atC height must be same as .canvas and it would be shown in ghm */
	this.drawMcm_onetrack(tkobj);

	if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
		this.regionLst=this.decoy_dsp.bak_regionLst;
		this.dspBoundary=this.decoy_dsp.bak_dspBoundary;
	}
}

// horizontal line
if(tkobj.horizontallines &&
	(isNumerical(tkobj) || tkobj.ft==FT_matplot || tkobj.ft==FT_cm_c) &&
	tkobj.qtc.height>=20 &&
	(tkobj.maxv!=undefined && tkobj.minv!=undefined)) {
	for(var i=0; i<tkobj.horizontallines.length; i++) {
		var v=tkobj.horizontallines[i];
		if(v.value>tkobj.minv && v.value<tkobj.maxv) {
			var y=parseInt(densitydecorpaddingtop+tkobj.qtc.height*(tkobj.maxv-v.value)/(tkobj.maxv-tkobj.minv));
			ctx.fillStyle=v.color;
			ctx.fillRect(0,y,tc.width,1);
			if(tosvg) svgdata.push({type:svgt_line, x1:0,y1:y, x2:tc.width, y2:y, w:1, color:ctx.fillStyle});
			v._y=y;
		}
	}
}

this.drawTrack_header(tkobj);

if(this.trunk) {
	// is splinter
	this.trunk.synctkh_padding(tkobj.name);
} else {
	// is trunk
	for(var tag in this.splinters) {
		var b=this.splinters[tag];
		var o=b.findTrack(tkobj.name);
		if(o) {
			o.canvas.width=o.canvas.width;
			b.drawTrack_browser(o,false);
		} else {
			/* in case of splinting, unfinished chip is inserted into trunk.splinters
			and resizing trunk will re-draw all tracks in trunk
			but the splinter tracks are not ready
			*/
		}
	}
	this.synctkh_padding(tkobj.name);
}
// highlight region
if(!this.is_gsv()) {
	for(var i=0; i<this.highlight_regions.length; i++) {
		var pos=this.region2showpos(this.highlight_regions[i]);
		if(!pos) continue;
		var hc=colorstr2int(colorCentral.hl);
		for(var j=0; j<pos.length; j++) {
			var w=pos[j][1];
			if(!w || w>this.hmSpan*.75) continue;
			ctx.fillStyle='rgba('+hc[0]+','+hc[1]+','+hc[2]+','+0.5*(1-w/(this.hmSpan*.75))+')';
			ctx.fillRect(pos[j][0],0,Math.max(2,w),tc.height);
		}
	}
}

return svgdata;
}
