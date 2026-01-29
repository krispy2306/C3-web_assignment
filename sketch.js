let song;   
let fft;
let amp;
let noiseOffset = 0;
let isMuted = false;
let audioStarted = false;

// preload audio file - change song path here
function preload() {
    song = loadSound("assets/ethereal-ambient-music-55115.mp3", loaded); 
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0,0);
  cnv.style('z-index', '-1');  // behind picture
  cnv.style('position', 'fixed'); // stays on scroll

  angleMode(DEGREES);
  colorMode(HSB);
  
  fft = new p5.FFT(0.8, 256);
  amp = new p5.Amplitude();
  amp.smooth(0.8);

  // mute button functionality
  const muteButton = document.getElementById('muteButton');
  muteButton.addEventListener('click', toggleMute);
}

function loaded() {
  console.log("Audio loaded, waiting for user interaction");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// audio start 
function startAudio() {
  if (!audioStarted && song.isLoaded()) {
    userStartAudio();
    song.loop();
    song.setVolume(0.5);
    audioStarted = true;
  }
}

function mousePressed(){
  startAudio();
}

function touchStarted(){
  startAudio();
  return false;  // prevent default
}

function keyPressed() {
  startAudio();
}

function draw() { 
  background(0,20);

  if (song && song.isLoaded() && song.isPlaying()) {
    stroke(50);
    translate(width / 2, height / 2);
  
    let spectrum = fft.analyze();
    let level = amp.getLevel(); 
    let baseRadius = min(width, height) * 0.32;
    let maxRadius = min(width, height);
    let minRadius = 20;
    let step = 1;
  
    // overall amplitude scaling
    let overallMovement = level * 150;
    //let bass = fft.getEnergy("bass");
    //let mid = fft.getEnergy("mid");
    //let treble = fft.getEnergy("treble");
    //let overallEnergy = (bass + mid + treble) / 3;
  
    for (let i = 0; i < spectrum.length; i += step) {
        let angle = map(i, 0, spectrum.length, 0, 360);
        let ampVal = spectrum[i];
    
        // blending frequency band energies
        let t = i / spectrum.length; 
        let energyBlend; 

       // if (t < 0.33) {
     //       energyBlend = lerp(bass, overallEnergy, t * 3);
      //  } else if (t < 0.66) {
      //      energyBlend = lerp(mid, overallEnergy, (t - 0.33) * 3);
      //  } else {
      //      energyBlend = lerp(treble, overallEnergy, (t - 0.66) * 3);
      //  }

        let combinedAmp = lerp(ampVal, energyBlend, 0.7);

        let freqBias = map(t, 0, 1, 1.2, 0.9); // gradual scaling across spectrum
        let audioOffset = minRadius + pow(ampVal / 255, 1.3) * 150 + overallMovement;
        audioOffset *= freqBias;
    
        let r = baseRadius + audioOffset;
    
    
        let distortionStrength = map(mouseX, 0, width, 3, 15) * (1 - t);
        let distortionSpeed = map(mouseY, 0, height, 0.002, 0.02);
    
        // distortion proportional to radius
        let distortionScale = r / maxRadius;
        let noiseFactorX = cos(angle) * (noise(i * 0.05, noiseOffset) - 0.5) * distortionStrength * distortionScale;
        let noiseFactorY = sin(angle) * (noise(i * 0.05, noiseOffset + 100) - 0.5) * distortionStrength * distortionScale;
        
        let x = r * cos(angle) + noiseFactorX;
        let y = r * sin(angle) + noiseFactorY;
        
        // colour mapping
        let hue = map(audioOffset, 0, 300, 180, 360);
        let brightness = map(level, 0, 1, 70, 100);
        stroke(hue, 100, brightness);
        
        strokeWeight(1 + level * 3); // line thickness responds to amplitude
        
          line(0, 0, x, y);
      }
    
      noiseOffset += map(mouseY, 0, height, 0.002, 0.02);
    } else {
        push();
        translate(width / 2, height / 2);
        stroke(100, 50, 80, 100);

        for (let i = 0; i < 360; i+=30) {
            let angle = i + frameCount * 0.5;
            let r = 100 + sin(frameCount * 0.2 + i) * 50;
            let x = r * cos(angle);
            let y = r * sin(angle);
            line(0, 0, x, y);
        }
        pop();
        
    }
}

function toggleMute() {
  if (!song) return;

  isMuted = !isMuted;
  song.setVolume(isMuted ? 0 : 1);
}

// coding 3 window
const openWorkBtn = document.getElementById("openWorkBtn");
const closeWorkBtn = document.getElementById("closeWorkBtn");
const workWindow = document.getElementById("workWindow");
const overlay = document.getElementById("overlay");
const workHeader = document.getElementById("workHeader");

function openWindow() {
  workWindow.style.display = "block";
  overlay.style.display = "block";
}

function closeWindow() {
  workWindow.style.display = "none";
  overlay.style.display = "none";
}

openWorkBtn.addEventListener("click", openWindow);
closeWorkBtn.addEventListener("click", closeWindow);
overlay.addEventListener("click", closeWindow);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWindow();
});

// drag logic
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

workHeader.addEventListener("mousedown", (e) => {
  isDragging = true;
  const rect = workWindow.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  workWindow.style.left = `${e.clientX - offsetX}px`;
  workWindow.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

const contrastBtn = document.getElementById("contrastToggle");
const contrastIcon = contrastBtn.querySelector(".contrast-icon");

contrastBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    // swaps icon
    if (document.body.classList.contains("light-mode")) {
        contrastIcon.src = "assets/moon icon.png";  // shows moon for dark mode
        contrastIcon.alt = "Switch to Dark Mode";
    } else {
        contrastIcon.src = "assets/sun icon.png";   // shows sun for light mode
        contrastIcon.alt = "Switch to Light Mode";
    }
});