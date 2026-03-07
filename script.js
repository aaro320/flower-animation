const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const music = document.getElementById('bgMusic');
const overlay = document.getElementById('overlay');

let gardenStarted = false;
let startTime = Date.now();
let heartTriggered = false;
let flowers = [];
let butterflies = [];
let particles = [];
let clouds = [];
let shootingStars = [];
let stars = [];

const message = {
    line1: "Happy Valentines Day,",
    line2: "Ellie! ^_^",
    opacity: 0,
    visible: false,
    fontSize: 0
};

// --- CORE FUNCTIONS ---

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    message.fontSize = Math.min(window.innerWidth / 12, 70);
    initStars(); 
}

const random = (min, max) => Math.random() * (max - min) + min;

overlay.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 1500);
    music.play().catch(() => console.log("Audio needs user interaction first"));
    gardenStarted = true;
    startTime = Date.now();
});

// --- CLASSES ---

class Star {
    constructor() {
        this.x = random(0, window.innerWidth);
        this.y = random(0, window.innerHeight);
        this.size = random(0.2, 1.2);
        this.blinkSpeed = random(0.01, 0.03);
        this.alpha = random(0.1, 1);
        this.growing = true;
    }
    update() {
        if (this.growing) { this.alpha += this.blinkSpeed; if (this.alpha >= 1) this.growing = false; }
        else { this.alpha -= this.blinkSpeed; if (this.alpha <= 0.1) this.growing = true; }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ShootingStar {
    constructor() { this.reset(); }
    reset() {
        this.x = random(window.innerWidth * 0.3, window.innerWidth);
        this.y = random(0, window.innerHeight * 0.4);
        this.len = random(80, 200);
        this.speed = random(10, 25);
        this.opacity = 1;
        this.active = false;
    }
    update() {
        if (!this.active && Math.random() < 0.005) this.active = true;
        if (this.active) {
            this.x -= this.speed;
            this.y += this.speed * 0.5;
            this.opacity -= 0.015;
            if (this.opacity <= 0) this.reset();
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.len, this.y - (this.len * 0.5));
        ctx.stroke();
        ctx.restore();
    }
}

class Butterfly {
    constructor() { this.reset(); }
    reset() {
        this.x = random(0, window.innerWidth);
        this.y = random(0, window.innerHeight);
        this.vx = random(-1.5, 1.5);
        this.vy = random(-1, 1);
        this.size = random(3, 5);
        this.wingAngle = 0;
        this.hue = random(200, 320); 
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.wingAngle += 0.2;
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
    }
    draw() {
        let ws = Math.abs(Math.sin(this.wingAngle)) * (this.size * 1.5);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillStyle = `hsl(${this.hue}, 100%, 75%)`;
        ctx.shadowBlur = 15; ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
        ctx.beginPath();
        ctx.ellipse(0, -ws/2, ws, this.size, 0.5, 0, Math.PI * 2);
        ctx.ellipse(0, ws/2, ws, this.size, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Flower {
    constructor(isHeartPart = false, targetX = 0, targetY = 0) {
        this.isHeartPart = isHeartPart;
        this.targetX = targetX;
        this.targetY = targetY;
        this.spawn();
    }
    spawn() {
        this.x = this.isHeartPart ? this.targetX : random(100, window.innerWidth - 100);
        this.maxH = this.isHeartPart ? (window.innerHeight - this.targetY) : random(200, window.innerHeight * 0.6);
        this.curH = 0;
        this.segments = Math.floor(random(6, 10));
        this.petalR = 0;
        this.maxPetalR = random(12, 25);
        this.bloomed = false;
        this.hue = this.isHeartPart ? random(340, 360) : random(280, 340);
        this.opacity = 0;
        this.state = 'GROWING';
        this.stayTimer = 0;
        this.maxStay = this.isHeartPart ? 1000 : random(500, 900);
        this.swayOffset = random(0, Math.PI * 2);
        this.segmentKinks = Array.from({length: this.segments}, () => random(-3, 3));
    }
    update() {
        this.sway = Math.sin(Date.now() * 0.001 + this.swayOffset) * (this.curH * 0.04);
        if (this.state === 'GROWING') {
            if (this.opacity < 1) this.opacity += 0.02;
            this.curH += 1.5;
            if (this.curH >= this.maxH) this.state = 'BLOOMING';
        } else if (this.state === 'BLOOMING') {
            this.bloomed = true;
            if (this.petalR < this.maxPetalR) this.petalR += 0.5;
            else {
                this.stayTimer++;
                if (this.stayTimer > this.maxStay) this.state = 'FADING';
            }
        } else if (this.state === 'FADING') {
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                if (this.isHeartPart) this.markedForDeletion = true;
                else this.spawn();
            }
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        let prevX = this.x;
        let prevY = window.innerHeight;
        for (let i = 1; i <= this.segments; i++) {
            const ratio = i / this.segments;
            const currentY = window.innerHeight - (this.curH * ratio);
            const currentX = this.x + (this.sway * Math.pow(ratio, 1.5)) + this.segmentKinks[i-1];
            ctx.strokeStyle = '#1a3317';
            ctx.lineWidth = Math.max(1, 4 * (1 - ratio * 0.6));
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(currentX, currentY); ctx.stroke();
            prevX = currentX; prevY = currentY;
        }
        if (this.bloomed) this.drawFlowerHead(prevX, prevY);
        ctx.restore();
    }
    drawFlowerHead(x, y) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 + (this.sway * 2)) * Math.PI / 180;
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
            ctx.beginPath();
            ctx.ellipse(x + Math.cos(angle)*(this.petalR*0.6), y + Math.sin(angle)*(this.petalR*0.6), this.petalR, this.petalR/1.8, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.arc(x, y, this.petalR/3, 0, Math.PI * 2); ctx.fill();
    }
}

// --- INITIALIZATION ---

function initStars() {
    stars = [];
    for (let i = 0; i < 200; i++) stars.push(new Star());
}

function spawnHeart() {
    heartTriggered = true;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.52;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 50;

    for (let t = 0; t < Math.PI * 2; t += 0.35) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        flowers.push(new Flower(true, centerX + x * scale, centerY + y * scale));
    }
}

function drawMessage() {
    if (!message.visible) return;
    ctx.save();
    ctx.font = `${message.fontSize}px "Dancing Script", cursive`;
    ctx.textAlign = "center";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "rgba(255, 105, 180, 0.6)";
    ctx.fillStyle = `rgba(255, 255, 255, ${message.opacity})`;
    ctx.fillText(message.line1, window.innerWidth / 2, window.innerHeight * 0.15);
    ctx.fillText(message.line2, window.innerWidth / 2, window.innerHeight * 0.15 + (message.fontSize * 1.2));
    ctx.restore();

    const elapsed = (Date.now() - startTime) / 1000;
    if (message.opacity < 1 && elapsed < 15) message.opacity += 0.008;
    if (elapsed > 25 && message.opacity > 0) message.opacity -= 0.008;
}

// --- ANIMATION LOOP ---

for(let i=0; i<15; i++) flowers.push(new Flower());
for(let i=0; i<15; i++) butterflies.push(new Butterfly());
for(let i=0; i<6; i++) shootingStars.push(new ShootingStar());

function animate() {
    ctx.fillStyle = 'rgba(2, 2, 8, 0.4)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    stars.forEach(s => { s.update(); s.draw(); });
    butterflies.forEach(b => { b.update(); b.draw(); });

    if (gardenStarted) {
        shootingStars.forEach(s => { s.update(); s.draw(); });
        const elapsed = (Date.now() - startTime) / 1000;
        
        if (elapsed > 4 && !heartTriggered) { spawnHeart(); message.visible = true; }
        if (elapsed > 45) { startTime = Date.now(); heartTriggered = false; message.visible = false; message.opacity = 0; }
        
        flowers = flowers.filter(f => !f.markedForDeletion);
        flowers.forEach(f => { f.update(); f.draw(); });
        drawMessage();
    }
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();