var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');

var colormap = ['#FCB860', '#5AFFE7', '#726EFF', '#08C6AB'];
colormap = ['#726eff', '#08c6ab', '#37465b', '#212b38'];

var canvW, canvH;

var fractalDeep = 7;
var FRACTAL_TYPE = 1;

var fullscreenMode = false;
var renderProcess;

// ------------------------------------------------ TRIANGLE SIERPINSKI
function drawTriangle(points, color) {
    ctx.strokeStyle = "#202020";
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(points[2][0], points[2][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[0][0], points[0][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function getMid(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
}

function sierpinski(points, degree) {
    let currentColor = colormap[degree % colormap.length];
    drawTriangle(points, currentColor);
    if (degree > 0) {
        sierpinski([points[0],
        getMid(points[0], points[1]),
        getMid(points[0], points[2])],
            degree - 1)
        sierpinski([points[1],
        getMid(points[0], points[1]),
        getMid(points[1], points[2])],
            degree - 1)
        sierpinski([points[2],
        getMid(points[2], points[1]),
        getMid(points[0], points[2])],
            degree - 1)
    }
}



function renderTriangle(deep = 0) {
    let margin = 16;
    myPoints = [[margin, canvH - margin],
    [(canvW - margin * 2) / 2 + margin, margin],
    [canvW - margin, canvH - margin]]
    sierpinski(myPoints, deep)
    if (deep < fractalDeep)
        renderProcess = setTimeout(() => renderTriangle(deep + 1), 500);
}
// ----------------------------------------------------------- NEWTONS POOLS

//Class for numbers a + bi
function complex(real, imag) {
    this.real = real;
    this.imag = imag;

    this.square = function () {
        var a = this.real;
        var b = this.imag;
        return new complex(a * a - b * b, 2 * a * b);
    }

    this.cube = function () {
        var a = this.real;
        var b = this.imag;
        return new complex(a * a * a - 3 * a * b * b, 3 * a * a * b - b * b * b);
    }

    this.abs = function () {
        var a = this.real;
        var b = this.imag;
        return (Math.sqrt(a * a + b * b));
    }

    this.neg = function () {
        var a = this.real;
        var b = this.imag;
        return new complex(-1 * a, -1 * b);
    }

    this.angle = function () {
        var a = this.real;
        var b = this.imag;
        if (a >= 0) {
            var theta = Math.atan(b / a);
        } else {
            var theta = Math.atan(b / a) + Math.PI;
        }
        if (arguments[0] == "deg") {
            theta = 180 * theta / Math.PI;
        }
        return theta;
    }
}

//Takes complex numbers (from the class "complex") as arguments and adds them
function add() {
    var a = 0;
    var b = 0;
    for (var i = 0; i < arguments.length; i++) {
        a = a + arguments[i].real;
        b = b + arguments[i].imag;
    }
    return new complex(a, b);
}

//Takes complex numbers (from the class "complex") as arguments and multiplies them
function multiply() {
    var a = arguments[0].real;
    var b = arguments[0].imag;
    for (var i = 1; i < arguments.length; i++) {
        var a2 = arguments[i].real;
        var b2 = arguments[i].imag;
        var aTemp = a;
        a = a * a2 - b * b2;
        b = aTemp * b2 + b * a2;
    }
    return new complex(a, b);
}

//takes two complex numbers (from class "complex") as parameters and divides the first by the second
function divide(comp1, comp2) {
    var a = comp1.real;
    var b = comp1.imag;
    var a2 = comp2.real;
    var b2 = comp2.imag;
    var aNew = (a * a2 + b * b2) / (a2 * a2 + b2 * b2);
    var bNew = (b * a2 - a * b2) / (a2 * a2 + b2 * b2);
    return new complex(aNew, bNew);
}

var xMin = -2;
var xMax = 2;
var yMin = -1;
var yMax = 1;

var position = new complex();
var root1 = new complex(1, 0);
var root2 = new complex(-0.5, Math.sqrt(3) / 2);
var root3 = new complex(-0.5, -1 * Math.sqrt(3) / 2);

function renderBasin(d1, d2, d3, x, y) {
    if (d1 < d2 && d1 < d3) {
        ctx.fillStyle = colormap[0];
        ctx.fillRect(x, y, 1, 1);
    } else if (d2 < d3) {
        ctx.fillStyle = colormap[1];
        ctx.fillRect(x, y, 1, 1);
    } else {
        ctx.fillStyle = colormap[2]
        ctx.fillRect(x, y, 1, 1);
    }
}

var generating = false;
var stop = true;

function generate() {
    function loop2() {
        setTimeout(function () {
            if (generating) {
                stop = true;
                loop2();
            } else {
                stop = false;
                generating = true;
                var iterations = fractalDeep;
                var y = 0;
                loop1();
                function loop1() {
                    setTimeout(function () {
                        for (var x = 0; x < canvas.width; x++) {
                            if (stop) { break; }
                            position.real = xMin + x * (xMax - xMin) / canvas.width;
                            position.imag = yMin + y * (yMax - yMin) / canvas.height;
                            for (var i = 0; i < iterations; i++) {
                                if (stop) { break; }
                                position = add(
                                    position,
                                    divide(
                                        add(
                                            new complex(-1, 0),
                                            position.cube()
                                        ),
                                        multiply(
                                            new complex(3, 0),
                                            position.square()
                                        )
                                    ).neg()
                                )
                            }
                            var dist1 = add(position, root1.neg()).abs();
                            var dist2 = add(position, root2.neg()).abs();
                            var dist3 = add(position, root3.neg()).abs();
                            renderBasin(dist1, dist2, dist3, x, y);
                        }
                        y++;
                        if (y < canvas.height && !stop) {
                            loop1();
                        } else {
                            generating = false;
                        }
                    }, 0);
                }
            }
        }, 0);
    }
    loop2();
}

// -------------------------------------------------- PLASMA ------------------------

function renderPlasma() {
    var N = Math.pow(2, fractalDeep);
    blockSize = canvW / N;

    k = [];
    for (y = 0; y < N; y++) k[y] = [];

    function avg(array) {
        return array.reduce((a, b) => a + b) / array.length
    }

    function init(h, c, e, g, l, n, o, p) {
        if (e > 1) {
            e = Math.floor(e / 2);
            g = Math.floor(g / 2);

            var i = avg([l, n, o, p]) + (Math.random() - .5) * (e + g) / N * 20;
            i = i < 0 ? 0 : i > 1 ? 1 : i;

            var s = avg([l, n]),
                t = avg([n, o]),
                u = avg([o, p]),
                v = avg([p, l]);

            init(h, c, e, g, l, s, i, v);
            init(h + e, c, e, g, s, n, t, i);
            init(h + e, c + g, e, g, i, t, o, u);
            init(h, c + g, e, g, v, i, u, p)
        } else {
            k[c][h] = avg([l, n, o, p])
        }
    }

    function draw() {
        let color;

        function drawLine(x,y) {
            if (x >= Math.floor(canvW / blockSize) || renderProcess == null) {
                return;
            }
            color = k[y][x];
            let e = (color >= .3 && color < .8) ?
                (color - .3) * 2 :
                (color < .3) ?
                    ((.3 - color) * 2) : ((1.3 - color) * 2);

            let g = color >= .5 ? (color - .5) * 2 : (.5 - color) * 2;

            color = "rgb("
                + Math.round((color < .5 ? color * 2 : (1 - color) * 2) * 255)
                + "," + Math.round(e * 255)
                + "," + Math.round(g * 255) + ")";

            ctx.fillStyle = color;
            ctx.fillRect(x * blockSize, y * blockSize, blockSize + 1, blockSize + 1);
            drawLine(x+1,y);
        }

        function drawing(y) {
            if (y >= Math.floor(canvH / blockSize) || renderProcess == null) {
                return;
            }
            drawLine(0, y);
            setTimeout(function() { drawing(y+1) }, 0);
        }

        renderProcess = setTimeout(function () {
            drawing(0);
        }, 0);
    };

    init(0, 0, N, N, Math.random(), Math.random(), Math.random(), Math.random());
    draw()
}

// ----------------------------------------------------------------------------


function resizeCanvas() {
    canvW = canvas.clientWidth;
    canvH = canvas.clientHeight;
    if ((canvas.width != canvW) || (canvas.height != canvH)) {
        canvas.height = canvH;
        canvas.width = canvW;
    }
}

function setRangeLimits(a, b) {
    let selectdeep = document.getElementById('select-deep');
    selectdeep.min = a;
    selectdeep.max = b;
    if (fractalDeep < a) selectdeep.value = a;
    if (fractalDeep > b) selectdeep.value = b;
    fractalDeep = selectdeep.value;
    document.getElementById('deep').innerHTML = fractalDeep;
}

function render() {
    resizeCanvas();
    clearTimeout(renderProcess);
    renderProcess = null;
    stop = true;
    ctx.clearRect(0, 0, canvW, canvW);
    switch (FRACTAL_TYPE) {
        case 1:
            renderTriangle();
            break;
        case 2:
            generate();
            break;
        case 3:
            renderPlasma();
            break;
        default:
            alert('Unknown type')
            break;
    }
}


document.getElementById('start-btn-id').onclick = function () {
    render();
}

document.getElementById('select-deep').onchange = function () {
    fractalDeep = this.value;
    document.getElementById('deep').innerHTML = fractalDeep;
    this.value = fractalDeep;
}

document.getElementById('deep').innerHTML = fractalDeep;

// --------------------------------------
let section = document.getElementById('main-section');
let controll = document.getElementsByClassName('controll')[0];
let btn = document.getElementsByClassName('start-btn')[0];
let fs_checkbox = document.getElementById('fs-checkbox');

function initFullscreenCss() {
    section.style = "flex-direction: column";
    canvas.style = "width: 99vw; heigth: 100vw";
    controll.style = "width: 100%; flex-direction: row; justify-content: space-between"
    btn.style = "width: 20%";
}

function initDefaultScreenCss() {
    section.style = "flex-direction: row-revers";
    canvas.style = "width: 85%; height: 93vh";
    controll.style = "width: 20%; flex-direction: column-reverse"
    btn.style = "width: 100%";
    fs_checkbox.checked = false;
}

fs_checkbox.onchange = function () {
    fullscreenMode = !fullscreenMode;
    fullscreenMode ? initFullscreenCss() : initDefaultScreenCss()
}

let select_btns = document.querySelectorAll('.select-btn');
select_btns.forEach(element => {
    element.onclick = function () {
        select_btns.forEach(x => x.classList.remove('active'));
        element.classList.add('active');
        FRACTAL_TYPE = Number(element.value);
        switch (FRACTAL_TYPE) {
            case 1:
                setRangeLimits(0, 9);
                break;
            case 2:
                setRangeLimits(1, 9);
                break;
            case 3:
                setRangeLimits(4, 10);
                break;
        }
    }
});

// -- init ---

document.querySelector('.select-btn[value="' + FRACTAL_TYPE + '"]').classList.add('active');
initDefaultScreenCss();