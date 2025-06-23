const petSprite = document.getElementById("pet-sprite");
let ageUpdateInterval = null;
let isWindowActive = true;

document.addEventListener("visibilitychange", () => {
  isWindowActive = !document.hidden;
});

let pet = {
  birthDate: new Date().toISOString(),
  hunger: 100,
  energy: 100,
  mood: "Happy",
  alive: true,
  hatched: false,
  lastUpdated: new Date().toISOString(),
  affection: 50,
  name: ""
};

function savePetState() {
  localStorage.setItem("pet", JSON.stringify(pet));
}

function loadPetState() {
  const saved = JSON.parse(localStorage.getItem("pet"));
  if (saved) {
    pet = saved;

    if (!pet.name) pet.name = "";
    
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
  if (pet.name && pet.name.trim() !== "") {
    document.getElementById("Nameme").style.display = "none";
    document.getElementById("pet-ui").classList.remove("hidden-until-named");
  }  
  const age = getPetAgeDays();
  document.getElementById("age").textContent = age;
  document.getElementById("hunger").textContent = pet.hunger;
  document.getElementById("energy").textContent = pet.energy;
  document.getElementById("mood").textContent = pet.mood;
  document.getElementById("affection-bar").style.width = `${pet.affection}%`;
  
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

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
      if (Notification.permission === "granted" && pet.alive && !isWindowActive) {
        new Notification("⚠️ Your pet needs you!", {
          body: `THE EGG IS HATCHING`,
          icon: `assets/sprites/${getCurrentSprite()}.png`,
          silent: false
        });
      }  
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
  pet.affection = Math.min(100, pet.affection + 5);
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
  pet.affection = Math.min(100, pet.affection + 10);
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

function getCurrentSprite() {
  const age = getPetAgeDays();
  if (!pet.alive) return "grave";
  if (age < 5) return "egg";
  if (age >= 5 && age < 10) return "baby-cat";
  return "adult-cat";
}

function updateStats() {
  if (!pet.alive) return;

  const now = new Date();
  const then = new Date(pet.lastUpdated);
  const diffMins = Math.floor((now - then) / (1000 * 10));

  if (diffMins > 0) {
    pet.hunger = Math.max(0, pet.hunger - diffMins * 5);
    pet.energy = Math.max(0, pet.energy - diffMins * 5);
    pet.affection = Math.max(0, pet.affection - diffMins * 9);
    if (Notification.permission === "granted" && (pet.hunger <= 30 || pet.energy <= 30) && pet.alive  && !isWindowActive) {
      new Notification("⚠️ Your pet needs you!", {
        body: `Hunger: ${pet.hunger}, Energy: ${pet.energy}`,
        icon: `assets/sprites/${getCurrentSprite()}.png`,
        silent: false
      });
    }
    if (Notification.permission === "granted" && pet.affection <= 30 && pet.alive && !isWindowActive) {
      new Notification("⚠️ Your pet needs you!", {
        body: `Your pet is getting lonely! Affection: ${pet.affection}`,
        icon: `assets/sprites/${getCurrentSprite()}.png`,
        silent: false
      });
    }    

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

function setPetName() {
  const input = document.getElementById("pet-name-input");
  pet.name = input.value.trim();
  savePetState();

  if (pet.name) {
    document.getElementById("pet-ui").classList.remove("hidden-until-named");
  }
}

function initPet() {
  loadPetState();
  updateStats();
  updateUI();
  setInterval(updateStats, 10000);
  setInterval(updateUI, 10000);
}

const floatingName = document.getElementById("floating-name");

petSprite.addEventListener("mouseenter", () => {
  if (pet.name && pet.name.trim() !== "" && pet.name !== "Unnamed") {
    floatingName.textContent = pet.name;
    floatingName.classList.remove("hidden");
  }
});

petSprite.addEventListener("mousemove", (e) => {
  floatingName.style.left = `${e.pageX}px`;
  floatingName.style.top = `${e.pageY}px`;
});

petSprite.addEventListener("mouseleave", () => {
  floatingName.classList.add("hidden");
});


initPet();
