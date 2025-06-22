const petSprite = document.getElementById("pet-sprite");
let ageUpdateInterval = null;


let pet = {
  birthDate: new Date().toISOString(),
  hunger: 100,
  energy: 100,
  mood: "Happy",
  alive: true
};

function savePetState() {
  localStorage.setItem("pet", JSON.stringify(pet));
}

function loadPetState() {
  const saved = JSON.parse(localStorage.getItem("pet"));
  if (saved) pet = saved;
  else savePetState();
}

function getPetAgeDays() {
  const today = new Date();
  const born = new Date(pet.birthDate);
  return Math.floor((today - born) / (1000 * 60 * 60 * 24));
}

function updateUI() {
  const age = getPetAgeDays();
  document.getElementById("age").textContent = age;
  document.getElementById("hunger").textContent = pet.hunger;
  document.getElementById("energy").textContent = pet.energy;
  document.getElementById("mood").textContent = pet.mood;

  // Handle sprite state
  let sprite;
  if (!pet.alive) {
    petSprite.classList.remove("bouncing");
    sprite = "grave.png";
    document.getElementById("mood").textContent = "Gone";
    document.querySelector(".buttons").innerHTML = "<p>Your pet has passed away.<br><button onclick='resetPet()'>Start New Pet</button></p>";
  } else {
    petSprite.classList.add("bouncing");
    if (age <= 5) {
        sprite = "egg.png";
    };
    if (age >= 5) {
        sprite = "baby-cat.png";
    };
    if (age >= 10) {
        sprite = "adult-cat.png";
    };
  }

  document.getElementById("pet-sprite").src = `assets/sprites/${sprite}`;
  savePetState();
}

function feedPet() {
  if (!pet.alive) return;
  pet.hunger = Math.min(100, pet.hunger + 20);
  pet.mood = "Content";
  updateUI();
}

function playWithPet() {
  if (!pet.alive) return;
  pet.energy = Math.max(0, pet.energy - 10);
  pet.mood = "Excited";
  updateUI();
}

function putToSleep() {
  if (!pet.alive) return;
  pet.energy = 100;
  pet.mood = "Sleepy";
  updateUI();
}

function updateStats() {
  if (!pet.alive) return;

  pet.hunger = Math.max(0, pet.hunger - 5);
  pet.energy = Math.max(0, pet.energy - 5);

  if (pet.hunger <= 0 && pet.energy <= 0) {
    pet.alive = false;
  } else if (pet.hunger < 20 || pet.energy < 20) {
    pet.mood = "Grumpy";
  }

  updateUI();
}

function resetPet() {
  localStorage.removeItem("pet");
  location.reload();
}

function toggleAgeDetails() {
  const popup = document.getElementById("age-popup");
  const details = document.getElementById("age-details");

  if (popup.classList.contains("hidden")) {
    popup.classList.remove("hidden");
    ageUpdateInterval = setInterval(() => {
        const born = new Date(pet.birthDate);
        const now = new Date();
        const diffMs = now - born;

        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        details.innerHTML = `<p>${hours} <strong>Hours</strong> ${minutes} <strong>Minutes</strong> ${seconds} <strong>Seconds</strong> <strong>Old</strong></p>`;
    }, 10);
  } else {
    popup.classList.add("hidden");
  }
}

function playButtonSound() {
  const sound = document.getElementById("button-sound");
  sound.currentTime = 0; // rewind to start
  sound.play();
}

function initPet() {
  loadPetState();
  updateUI();
  setInterval(updateStats, 10000); // decay stats every 10 seconds
}

initPet();
