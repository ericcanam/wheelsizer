import { nextTick } from 'vue';

// draw the QR code
function drawCanvas(url, setup, destination, qrprops, logo){
    // get set up
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    const w = 1300; canvas.width = w;
    const h = 1300; canvas.height = h;

    // draw lines
    const line_sep = 100;
    const margin = 50;
    
    const background = "#272727";
    const foreground = "#ffffff";
    const colour = ['#0077ff', '#08b450', '#df9904', '#d83939'];
    const colours = colour.length;

    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    // draws background colour
    ctx.fillStyle = background;
    ctx.fillRect(0,0, w,h);

    // creates rainbow array of 45 degree lines
    for(let c=0; c<colours; c++){
        ctx.strokeStyle = colour[c];
        ctx.beginPath();
        for(let y=(line_sep*(c+0.5)); y<=(h+w-(4*margin)); y+=line_sep*colours){

            // x & y offset for lines that start out of bounds
            let offset = Math.min(0, h-(2*margin)-y);

            // x & y line component
            let linecomp = Math.min(w-(2*margin), y);

            ctx.moveTo(margin-offset, margin+y+offset);
            ctx.lineTo(margin+linecomp, margin+y-linecomp);

            // Draw the Path
            ctx.stroke();
        }
        ctx.closePath();
    }

    const obj_margin = 50;
    const obj_pad = 50;

    // clears space for logo
    const logo_w = w-2*obj_margin-2*margin;
    const logo_h = (logo_w-(2*obj_pad)) * (logo.naturalHeight/logo.naturalWidth) + (2*obj_pad);
    ctx.beginPath(); 
    ctx.roundRect(obj_margin+margin,h-obj_margin-logo_h-margin, logo_w,logo_h, 25);
    ctx.fill();
    ctx.closePath();

    // draws logo
    ctx.drawImage(logo, obj_margin+margin+obj_pad, h-(margin+logo_h),
                        logo_w-2*obj_pad, logo_h-2*obj_pad);

    // clears square for QR code
    const qrs = h-logo_h-3*obj_margin-2*margin;
    ctx.beginPath();
    ctx.roundRect(obj_margin+margin,obj_margin+margin, qrs,qrs, 25);
    ctx.fill();
    ctx.closePath();

    // draw QR code
    qrprops.value = url;
    qrprops.size = qrs;
    qrprops.background = background;
    qrprops.foreground = foreground;

    // shove QR code in there
    let qrraw = document.getElementById("qrraw");
    nextTick(function(){ // delayed so that qrcode-vue can update its canvas
        ctx.drawImage(qrraw, obj_margin+margin+obj_pad, obj_margin+margin+obj_pad,
                            qrs-(2*obj_pad), qrs-(2*obj_pad));
    });

    // clears space for setup info
    ctx.beginPath();
    let textarea_w = w-qrs-(2*margin)-(3*obj_margin);
    let textarea_x = (2*obj_margin)+margin+qrs;
    ctx.roundRect(textarea_x,obj_margin+margin, textarea_w,qrs, 25);
    ctx.fill();
    ctx.closePath();

    // writes some setup stuff
    let fontsize = 50;
    let lineheight = 1.2;
    ctx.font = "normal normal 300 "+fontsize+"px 'Fira Sans'";
    ctx.textAlign = "center";
    // center line
    let textarea_c = textarea_x+(textarea_w/2);
    // set font colour
    ctx.fillStyle = foreground;
    const lines = [];
    if(setup.wheels){
        lines.push(
            "Wheels",
            setup.wheels.diameter + "x" + setup.wheels.width + " ET" + setup.wheels.offset,
            setup.wheels.holes + "x" + setup.wheels.pcd + " CB" + setup.wheels.bore
        );
    }if(setup.wheels && setup.tires){
        lines.push("");
    }
    if(setup.tires){
        lines.push(
            "Tires",
            setup.tires.section + "/" + setup.tires.ratio + "R" + setup.tires.diameter
        );
    }
    // calculate total height of text
    let text_h = (fontsize*(0.5+lines.length)*lineheight);
    let text_y = (qrs-text_h)/2;

    for(let l=0; l<lines.length; l++){
        ctx.fillText(lines[l], textarea_c, margin+obj_margin+obj_pad+(fontsize*(0.5+l)*lineheight)+text_y);
    }
    
    // get dataURL and shove it into the <img>
    nextTick(function(){ // delayed to ensure updates are made
        destination.src = canvas.toDataURL();
    });
}
// clear the QR code
function clearCanvas(object){
    object.src = "";
}

export { drawCanvas, clearCanvas };