const petSprite = document.getElementById("pet-sprite");
let ageUpdateInterval = null;

let pet = {
  birthDate: new Date().toISOString(),
  hunger: 100,
  energy: 100,
  mood: "Happy",
  alive: true,
  hatched: false,
  lastUpdated: new Date().toISOString()
};

function savePetState() {
  localStorage.setItem("pet", JSON.stringify(pet));
}

function loadPetState() {
  const saved = JSON.parse(localStorage.getItem("pet"));
  if (saved) {
    pet = saved;
    
    if (!pet.lastUpdated) {
      pet.lastUpdated = new Date().toISOString();
    }

    const now = new Date();
    const then = new Date(pet.lastUpdated);
    const minsGone = Math.floor((now - then) / (1000 * 60));

    if (minsGone > 0 && pet.alive) {
      setTimeout(() => {
        alert(`Your pet missed you for ${minsGone} minute${minsGone === 1 ? '' : 's'}!`);
      }, 500);
    }
  } else {
    savePetState();
  }
}

function getPetAgeDays() {
  const now = new Date();
  const born = new Date(pet.birthDate);
  return Math.floor((now - born) / (1000 * 60 * 5));
}

function updateUI() {
  const age = getPetAgeDays();
  document.getElementById("age").textContent = age;
  document.getElementById("hunger").textContent = pet.hunger;
  document.getElementById("energy").textContent = pet.energy;
  document.getElementById("mood").textContent = pet.mood;

  let sprite;
  if (!pet.alive) {
    petSprite.classList.remove("bouncing");
    sprite = "grave.png";
    document.getElementById("mood").textContent = "Gone";
    document.querySelector(".buttons").innerHTML = "<p>Your pet has passed away.<br><button onclick='resetPet()'>Start New Pet</button></p>";
  } else {
    petSprite.classList.add("bouncing");
    if (age < 5) {
      sprite = "egg.png";
    } else if (age >= 5 && !pet.hatched) {
      petSprite.src = `assets/sprites/egg.png`;
      petSprite.classList.remove("bouncing");
      petSprite.classList.add("hatching");

      setTimeout(() => {
        petSprite.classList.remove("hatching");
        petSprite.classList.add("bouncing");
        petSprite.src = `assets/sprites/baby-cat.png`;
        pet.hatched = true;
        savePetState();
      }, 1000);

      return;
    } else if (age >= 5 && age < 10) {
      sprite = "baby-cat.png";
    } else if (age >= 10) {
      sprite = "adult-cat.png";
    }
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
  if (pet.energy <= 0) {
    pet.hunger = Math.max(0, pet.hunger - 20);
  } else {
    pet.energy = Math.max(0, pet.energy - 10);
  }
  pet.mood = "Excited";
  updateUI();
}

function putToSleep() {
  if (!pet.alive) return;
  pet.energy = 100;
  pet.hunger = Math.max(0, pet.hunger - 25);
  pet.mood = "Sleepy";
  updateUI();
}

function updateStats() {
  if (!pet.alive) return;

  const now = new Date();
  const then = new Date(pet.lastUpdated);
  const diffMins = Math.floor((now - then) / (1000 * 10));

  if (diffMins > 0) {
    pet.hunger = Math.max(0, pet.hunger - diffMins * 5);
    pet.energy = Math.max(0, pet.energy - diffMins * 5);

    if (pet.hunger <= 0 && pet.energy <= 0) {
      pet.alive = false;
    } else if (pet.hunger < 20 || pet.energy < 20) {
      pet.mood = "Grumpy";
    }
  }
  pet.lastUpdated = now.toISOString();

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

      details.innerHTML = `<p>Your Pet is ${hours} <strong>Hours</strong> ${minutes} <strong>Minutes</strong> ${seconds} <strong>Seconds</strong> Old</p>`;
    }, 10);
  } else {
    popup.classList.add("hidden");
    clearInterval(ageUpdateInterval);
  }
}

function toggleAbout() {
  const popup = document.getElementById("about-popup");
  popup.classList.toggle("hidden");
}

function playButtonSound() {
  const sound = document.getElementById("button-sound");
  sound.currentTime = 0;
  sound.play();
}

function initPet() {
  loadPetState();
  updateStats(); // apply offline decay
  updateUI();
  setInterval(updateStats, 10000);
  setInterval(updateUI, 1000);
}

initPet();
