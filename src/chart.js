var chart = {};
(function(chart){

    var Inline = function(ctx, width, height, bcolor){
        this.bcolor  = bcolor;

        this.width   = width;
        this.height  = height;
        this.ctx     = ctx;
        this.marginX = 50;
        this.marginY = 80;
        this.lines   = [];

        this.bot_line = null;
        this.top_line = null;

        this._title   = null;
        this._title_options = {};

        this._xlabel  = null;
        this._xlabel_options = {};
        this._ylabel  = null;
        this._ylabel_options = {};

        this.maxX = 0;
        this.maxY = 0;
        this.minX = 0;
        this.minY = 0;
    };
    chart.Inline = Inline;

    Inline.prototype.clear = function(){
        this.maxX = 0;
        this.maxY = 0;
        this.minX = 0;
        this.minY = 0;
        this.ctx.translate(0, 0);
        this.ctx.clearRect(0, 0, this.width, this.height);
    };

    Inline.prototype.scaleX = function(qtd){
        var max = this.maxX;
        var min = this.minX;

        var ctx = this.ctx;

        var width = this.width - 2*this.marginX;
        var delta  = max - min;
        this.propX = (delta == 0) ? 1 : width/delta;
        var scale  = (delta == 0) ? 1 : Math.ceil(60/this.propX)*2;
        this.scale_x = scale;
        var x = 0;

        ctx.save();
        ctx.beginPath();
        ctx.translate(this.marginX, this.marginY);
        ctx.lineWidth = 1;
        ctx.font = "16px Georgia";
        ctx.textAlign="center";

        var i = 0;
        while(true){
            if(++i > 100) break;

            if(min >= this.maxX || min == null) break;
            ctx.lineTo(x*this.propX, 0);
            ctx.fillText(min.toFixed(0), x*this.propX, this.height-(2*this.marginY)+16);
            x += scale;
            min += scale;
        }

        if(this._xlabel != null){
            for(var k in this._xlabel_options){
                draw.ctx[k] = this.fill_options[k];
            }
            var font_size = ctx.font.match(/\d+/);
            var size = font_size * this._xlabel.length;
            ctx.fillStyle='#000';
            ctx.fillText(this._xlabel, width/2, this.height-(2*this.marginY)+40);
        };

        ctx.stroke();
        ctx.restore();
    };

    Inline.prototype.scaleY = function(){
        var height = this.height - 2*this.marginY;

        this.h = height;
        var delta  = this.maxY - this.minY;
        var min    = this.minY;
        this.propY = (delta == 0) ? 1 : height/delta;
        var scale  = (delta == 0) ? 1 : Math.ceil(60/this.propY);
        this.scale_y = scale;
        var y = 0;

        var ctx = this.ctx;
        ctx.save();
        ctx.translate(this.marginX, this.height-this.marginY);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.font = "16px Georgia";

        while(true){
            if(min >= this.maxY || min == null) break;
            ctx.lineTo(0, y*this.propY);
            ctx.fillText(min.toFixed(0), -25, (y*this.propY)+4);
            y -= scale;
            min += scale;
        }

        if(this._ylabel != null){
            ctx.save();
            ctx.translate(this.marginX, this.height-this.marginY);
            ctx.beginPath();
            ctx.stroke();
            ctx.restore();
            for(var k in this._ylabel_options){
                draw.ctx[k] = this.fill_options[k];
            }
            var font_size = ctx.font.match(/\d+/);
            var size = font_size * this._xlabel.length;
            ctx.rotate(-Math.PI/2);
            var y = (height/2) - (size/2);
            ctx.textAlign="center";
            ctx.fillStyle='#000';
            ctx.fillText(this._ylabel, (delta/2)*this.propY, 0-(this.marginY-(font_size/2))+10);
        };

        ctx.stroke();
        ctx.restore();
    };

    Inline.prototype.setTitle = function(label, options){
        this._title = label;
        this._title_options = options;
    };

    Inline.prototype.setXLabel = function(label, options){
        this._xlabel = label;
        this._xlabel_options = options;
    };

    Inline.prototype.setYLabel = function(label, options){
        this._ylabel = label;
        this._ylabel_options = options;
    };

    Inline.prototype.setGrid = function(flag, options){
        this._grid = flag;
        this._grid_options = options;
    };

    Inline.prototype.grid = function(){

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.marginX, this.marginY);

        for(var i in this._grid_options){
            var value = this._grid_options[i];
            this.ctx[i] = value;
        };

        //Horizontal
        var min = this.minY;
        while(true){
            min += this.scale_y;
            if(min >= this.maxY || min == null) break;
            var y = this.calcY(min);
            var x = this.calcX(this.minX);
            var maxX = this.calcX(this.maxX);
            while(true){
                if(x >= maxX) break;
                x += 2;
                this.ctx.moveTo(x, y);
                x += 2;
                this.ctx.lineTo(x, y);
            }
        }

        //Vertical
        var min = this.minX;
        while(true){
            min += this.scale_x;
            if(min >= this.maxX || min == null) break;
            var x = this.calcX(min);
            var y = this.calcY(this.minY);
            var maxY = this.calcY(this.maxY);
            while(true){
                if(y <= maxY) break;
                y -= 2;
                this.ctx.moveTo(x, y);
                y -= 2;
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
        this.ctx.restore();
    };

    Inline.prototype.calculeLimits = function(){

        var isCalculed = false;
        for(var i in this.lines){

            var v = this.lines[i];
            if(v == this.top_line || v == this.bot_line){
                continue;
            }

            if(isCalculed == false){
                this.maxX = Math.ceil(v.maxX);
                this.minX = Math.floor(v.minX);
                this.maxY = Math.ceil(v.maxY);
                this.minY = Math.floor(v.minY);
                isCalculed = true;
            }
            if(v.maxX > this.maxX) this.maxX = Math.floor(v.maxX);
            if(v.maxY > this.maxY) this.maxY = Math.ceil(v.maxY);
            if(v.minX != null && v.minX < this.minX){
                this.minX = (v.minX < 1) ? 0 : Math.floor(v.minX);
            }
            if(v.minY != null && v.minY < this.minY) this.minY = (v.minY < 1) ? 0 : Math.floor(v.minY);
        };

        if(this.top_line != null) this.top_line.list = [[this.minX, this.maxY], [this.maxX, this.maxY]];
        if(this.bot_line != null) this.bot_line.list = [[this.minX, this.minY], [this.maxX, this.minY]];
    };

    Inline.prototype.background = function(x,y,w,h, options){

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();

        for(var k in options){
            this.ctx[k] = options[k];
        }

        this.ctx.fillRect(0, 0, w, h);

        this.ctx.stroke();
        this.ctx.restore();
    };

    Inline.prototype.draw = function(){

        var self = this;

        this.clear();
        this.calculeLimits();

        if(this.bcolor != undefined){
            this.background(0,0,this.width,this.height, {fillStyle: this.bcolor});
        }

        this.scaleX();
        this.scaleY();
        this.background(this.marginX,this.marginY,this.calcX(this.maxX),this.calcY(this.minY), {fillStyle: '#FFF'});

        var fill_labels = [];
        for(var k in this.lines){
            var v = this.lines[k];
            v.drawFill(this);
            if(v.fill_label != null){
                fill_labels.push(v);
            }
        }

        this.grid();

        for(var i in this.lines){
            var v = this.lines[i];
            v.drawLine(this);
        }

        this.drawBorder();

        for(var i in this.lines){
            var v = this.lines[i];
            if(v.show_dot) v.drawDot(this);
        }

        this.drawLegend(fill_labels);
        this.drawTitle();
    };

    Inline.prototype.drawTitle = function(){

        this.ctx.save();
        this.ctx.translate(0, 0);
        this.ctx.font = "16px Georgia";
        this.ctx.textAlign="center";

        this.ctx.fillText(this._title, this.width/2, this.marginY/2);

        this.ctx.stroke();
        this.ctx.restore();
    };

    Inline.prototype.drawLegend = function(fills){

        this.ctx.save();
        this.ctx.translate(this.marginX, this.marginY);
        this.ctx.lineWidth = 1;

        var delta  = this.maxX - this.minX;
        var length = fills.length;
        var dist   = delta/length;

        this.ctx.font = "14px Georgia";
        this.ctx.textAlign="center";
        var x = 0;
        for(var k in fills){
            var v = fills[k];
            var calc_x = this.marginX + this.calcX(this.minX + x);
            if(v.fill_options.fillStyle) this.ctx.fillStyle = v.fill_options.fillStyle;
            this.ctx.fillRect(calc_x - 5, this.height - this.marginY - 4 - 26, 12, 12);
            this.ctx.rect(calc_x - 5, this.height - this.marginY - 4 - 26, 12, 12);
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(v.fill_label, calc_x, this.height - this.marginY-4);
            x += dist;
        }

        this.ctx.stroke();
        this.ctx.restore();
    };

    Inline.prototype.calcX = function(x){
        return (x-this.minX)*this.propX;
    };

    Inline.prototype.calcY = function(y){
        return this.h-((y-this.minY)*this.propY);
    };

    Inline.prototype.drawBorder = function(){
        this.ctx.save();
        this.ctx.translate(this.marginX, this.marginY);
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.calcX(this.maxX), this.calcY(this.maxY));
        this.ctx.lineTo(this.calcX(this.maxX), this.calcY(this.minY));
        this.ctx.lineTo(this.calcX(this.minX), this.calcY(this.minY));
        this.ctx.lineTo(this.calcX(this.minX), this.calcY(this.maxY));
        this.ctx.stroke();
        this.ctx.restore();
    };

    Inline.prototype.add = function(line){
        this.lines.push(line);
    };

    Inline.prototype.createLine = function(label, options){
        var line = new Inline.Line(label, options);
        this.add(line);
        return line;
    };

    Inline.prototype.createLineTop = function(label, options){
        if(options != undefined)
            options.strokeStyle = options.hasOwnProperty('strokeStyle') ? options['strokeStyle'] : '#000';
        var line = this.createLine(label, options);
        this.top_line = line;
        return line;
    }

    Inline.prototype.createLineBottom = function(label, options){
        if(options != undefined)
            options.strokeStyle = options.hasOwnProperty('strokeStyle') ? options['strokeStyle'] : '#000';
        var line = this.createLine(label, options);
        this.bot_line = line;
        return line;
    }

    Inline.Line = function(label, options){
        this.label        = label;
        this.fill_label   = null;
        this.fill_with    = null;
        this.fill_options = {};
        this.options  = options ? options : {};
        this.list     = [];
        this.minX     = null;
        this.minY     = null;
        this.maxX     = null;
        this.maxY     = null;
        this.show_dot = false;
    };

    Inline.Line.prototype.lineTo = function(x, y, label){

        if(this.list.length == 0){
            this.maxX = x;
            this.maxY = y;
            this.minX = x;
            this.minY = y;
        }

        if(x > this.maxX) this.maxX = x;
        if(y > this.maxY) this.maxY = y;
        if(x < this.minX) this.minX = x;
        if(y < this.minY) this.minY = y;
        this.list.push([x, y, label]);
    };

    Inline.Line.prototype.drawLine = function(draw){

        var self = this;
        draw.ctx.save();
        draw.ctx.translate(draw.marginX, draw.marginY);
        draw.ctx.beginPath();

        for(var k in this.options) draw.ctx[k] = this.options[k];

        var x = undefined;
        for(var k in this.list){
            var v = this.list[k];
            var x = (v[0]-draw.minX)*draw.propX;
            var x = draw.calcX(v[0]);
            var y = draw.calcY(v[1]);
            draw.ctx.lineTo(x, y);
        };

        draw.ctx.stroke();
        draw.ctx.restore();
    };

    Inline.Line.prototype.drawDot = function(draw){

        draw.ctx.save();
        draw.ctx.translate(draw.marginX, draw.marginY);
        draw.ctx.beginPath();

        for(var k in this.list){
            var v = this.list[k];
            var x = draw.calcX(v[0]);
            var y = draw.calcY(v[1]);
            draw.ctx.fillStyle = this.options.hasOwnProperty('strokeStyle') ? this.options['strokeStyle'] : '#000';
            draw.ctx.fillRect(x-4,y-4,8,8);
        };

        draw.ctx.stroke();
        draw.ctx.restore();

        this.drawDotLabel(draw);
    };

    Inline.Line.prototype.drawDotLabel = function(draw){

        draw.ctx.save();
        draw.ctx.translate(draw.marginX, draw.marginY);
        draw.ctx.beginPath();

        for(var k in this.list){
            var v = this.list[k];
            if(v[2] != undefined){
                var x = draw.calcX(v[0]);
                var y = draw.calcY(v[1]);
                var m_size = draw.ctx.measureText(v[2]);
                var w = m_size.width + 4;

                var m_size = draw.ctx.measureText(v[2]);
                var w = m_size.width + 4;
                draw.ctx.fillStyle = '#fff';
                draw.ctx.fillRect(x -(w/2), y+4, w, 16);
                draw.ctx.lineWidth = 1;
                draw.ctx.rect(x -(w/2), y+4, w, 16);

                //draw.ctx.fillStyle = this.options.hasOwnProperty('strokeStyle') ? this.options['strokeStyle'] : '#000';
                draw.ctx.fillStyle = '#000';
                draw.ctx.fillText(v[2], x-(w/2)+2, y+16);
            }
        };

        draw.ctx.stroke();
        draw.ctx.restore();
    };

    Inline.Line.prototype.drawFill = function(draw){

        if(this.fill_with == null) return;

        var self = this;
        draw.ctx.save();
        draw.ctx.translate(draw.marginX, draw.marginY);
        draw.ctx.beginPath();
        draw.ctx.lineWidth = 1;

        if(this.fill_options.hasOwnProperty('fillStyle')) draw.ctx.strokeStyle = this.fill_options.fillStyle;
        for(var k in this.fill_options){
            draw.ctx[k] = this.fill_options[k];
        }

        var firstX = null;
        var firstY = null;
        var x = undefined;

        for(var k in this.list){
            var v = this.list[k];
            var x = (v[0]-draw.minX)*draw.propX;
            var y = draw.h-((v[1]-draw.minY)*draw.propY);
            if(k == 0){
                firstX = x;
                firstY = y;
            }
            draw.ctx.lineTo(x, y);
        };

        var fill_line = this.fill_with;
        var tam = fill_line.list.length - 1;
        for(var i = tam; i >= 0; i--){
            var value = fill_line.list[i];
            var x = (value[0]-draw.minX)*draw.propX;
            var y = draw.h-((value[1]-draw.minY)*draw.propY);
            draw.ctx.lineTo(x, y);
        }

        draw.ctx.lineTo(firstX, firstY);
        draw.ctx.fill();

        draw.ctx.stroke();
        draw.ctx.restore();
    };

    Inline.Line.prototype.fillWith = function(line, label, options){
        this.fill_label = label;
        this.fill_with = line;
        this.fill_options = options;
    };

}(chart));
