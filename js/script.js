// Active Navbar Item

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((navItem) => {
  navItem.addEventListener("click", (e) => {
    e.preventDefault();

    const activeItem = document.querySelector(".nav-item.active");
    if (activeItem) {
      activeItem.classList.remove("active");
    }

    navItem.classList.add("active");
    const section = navItem.dataset.section || navItem.textContent.trim().toLowerCase();
    setAppSection(section);
  });
});

// Horizontal Scroll

const containers = document.querySelectorAll(".containers");

containers.forEach((container) => {
  let isDragging = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.pageX - container.offsetLeft;
    const step = (x - startX) * 0.6;
    container.scrollLeft = scrollLeft - step;
  });

  container.addEventListener("mouseup", () => {
    isDragging = false;
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
  });
});

// Music Player

const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const shuffleButton = document.querySelector(".shuffle-btn");
const repeatButton = document.querySelector(".repeat-btn");
const volumeSlider = document.getElementById("volume");
const volumeIcon = document.getElementById("volumeIcon");
const currentTimeLabel = document.getElementById("current-time");
const durationLabel = document.getElementById("duration");
const rotatingImage = document.getElementById("rotatingImage");
const songName = document.querySelector(".music-player h2");
const artistName = document.querySelector(".music-player p");
const searchInput = document.getElementById("songSearch");
const songContainer = document.querySelector(".song-container");
const artistContainer = document.getElementById("artistContainer");
const albumContainer = document.getElementById("albumContainer");
const sliderContainer = document.querySelector(".slider-container");
const artistsSection = document.querySelector(".artists");
const albumsSection = document.querySelector(".albums");
const recommendedSection = document.querySelector(".recommended-songs");
const musicPlayer = document.querySelector(".music-player");
const sectionPlaceholder = document.getElementById("sectionPlaceholder");

// Persisted user songs (stored as array of {title, artist, source, cover, duration})
let userSongs = [];
try {
  userSongs = JSON.parse(localStorage.getItem("userSongs") || "[]");
} catch (e) {
  console.warn("Failed to parse userSongs from localStorage", e);
  userSongs = [];
}
// Remove any accidental test entries left from ad-hoc testing
if (userSongs && userSongs.length) {
  const before = userSongs.length;
  userSongs = userSongs.filter(s => (s.title || '').trim() !== 'Test Song');
  if (userSongs.length !== before) {
    try { localStorage.setItem('userSongs', JSON.stringify(userSongs)); } catch (e) { /* ignore */ }
  }
}

function saveUserSongs() {
  try {
    localStorage.setItem("userSongs", JSON.stringify(userSongs));
  } catch (e) {
    console.warn("Could not save user songs:", e);
  }
}

function addUserSong(songObj) {
  userSongs.unshift(songObj);
  saveUserSongs();
  renderArtists();
  renderAlbums();
  renderSongs();
}

function getCombinedSongs() {
  return userSongs.concat(songs);
}

// No runtime UI binding for song addition.

let rotating = false;
let currentRotation = 0;
let rotationInterval;
let currentSongIndex = 0;
let isShuffled = false;
let isRepeating = false;
let currentSection = "discover";
let previousVolume = Number(volumeSlider?.value) || 1;

const songs = [
  {
    title: "Manzese",
    artist: "Navy Kenzo",
    source: "assets/music/Navy Kenzo - Manzese.mp3",
    cover: "assets/songs/navy.jpeg",
    duration: "3:20",
  },
  {
    title: "Nitaubeba",
    artist: "Harmonize",
    source: "assets/music/Harmonize - Nitaubeba.mp3",
    cover: "assets/songs/harmoinize.jpeg",
    duration: "4:10",
  },
  {
    title: "My Baby",
    artist: "Diamond Platnumz",
    source: "assets/music/Diamond Platnumz - My Baby (feat. Chike).mp3",
    cover: "assets/songs/diamond.jpeg",
    duration: "3:32",
  },
  {
    title: "Ma Cherie(Remix)",
    artist: "Bien Aime",
    source: "assets/music/Bien - Ma Cherie (Remix).mp3",
    cover: "assets/songs/bien.jpeg",
    duration: "2:53",
  },
  {
    title: "Down",
    artist: "Rayvanny",
    source: "assets/music/Rayvanny - Down.mp3",
    cover: "assets/songs/vanny.jpeg",
    duration: "2:42",
  },
  {
    title: "Champion Gal",
    artist: "Fik Fameica",
    source: "assets/music/Fik Fameica - Champion Gal.mp3",
    cover: "assets/artists/Fik2.jpg",
    duration: "2:58",
  },
  {
    title: "Katerina",
    artist: "Bruce Melody",
    source: "assets/music/Bruce Melodie - Katerina.mp3",
    cover: "assets/songs/bruce_melody.jpeg",
    duration: "4:35",
  },
  {
    title: "Mungu Baba",
    artist: "King Kaka",
    source: "assets/music/King Kaka - Mungu Baba.mp3",
    cover: "assets/songs/kaka.jpeg",
    duration: "3:59",
  },
  {
    title: "Baikoko",
    artist: "Mbosso",
    source: "assets/music/Baikoko By Mbosso ft. Diamond Platnumz.mp3",
    cover: "assets/songs/mbosso.jpeg",
    duration: "3:59",
  },
];

const artists = [
  { name: "Mbosso Khan", image: "assets/songs/mbosso.jpeg" },
  { name: "Diamond Platnumz", image: "assets/songs/diamond.jpeg" },
  { name: "Nyashinski", image: "assets/artists/shinski.jpeg" },
  { name: "Daddy Andre", image: "assets/artists/andre.jpeg" },
  { name: "Ali Kiba", image: "assets/artists/kingkiba.jpeg" },
  { name: "Khaligraph Jones", image: "assets/artists/khali.jpeg" },
  { name: "Element Eleeh", image: "assets/artists/element.jpg" },
  { name: "Billie Eilish", image: "assets/artists/billie-eilish.jpg" },
];

const albums = [
  { title: "Icarus Falls", artist: "Zayn", cover: "assets/albums/icarus falls - zayn.jpg" },
  { title: "The Purple Album", artist: "Lucas Graham", cover: "assets/albums/lucas graham - the purple album.jpg" },
  { title: "Red Pill Blues", artist: "Maroon 5", cover: "assets/albums/maroon5 - red pill blues.jpg" },
  { title: "Indigo", artist: "Chris Brown", cover: "assets/albums/chris brown - indigo.jpg" },
  { title: "Love Always", artist: "Shane Filan", cover: "assets/albums/love always - shane filan.jpg" },
];

const favorites = [
  songs[0],
  songs[1],
  songs[4],
];

function getSectionSongs() {
  const indexedSongs = songs.map((songItem, index) => ({ ...songItem, index }));

  switch (currentSection) {
    case "trending":
      return indexedSongs.slice(0, 5);
    case "favorites":
      return [indexedSongs[0], indexedSongs[1], indexedSongs[4]];
    case "playlist":
      return indexedSongs;
    case "discover":
    default:
      return indexedSongs;
  }
}

function startRotation() {
  if (!rotating) {
    rotating = true;
    rotationInterval = setInterval(rotateImage, 50);
  }
}

function pauseRotation() {
  clearInterval(rotationInterval);
  rotating = false;
}

function rotateImage() {
  currentRotation += 1;
  rotatingImage.style.transform = `rotate(${currentRotation}deg)`;
}

function formatTime(time) {
  if (!Number.isFinite(time)) {
    return "0:00";
  }

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function updateVolumeIcon(volume) {
  volumeIcon.className = "fa-solid " + (song.muted || volume === 0 ? "fa-volume-xmark" : volume < 0.5 ? "fa-volume-low" : "fa-volume-high");
}

function updatePlaybackIcons() {
  document.querySelectorAll(".song .overlay i").forEach((icon) => {
    const songItem = icon.closest(".song");
    if (!songItem) return;
    const index = Number(songItem.dataset.songIndex);
    const isCurrent = index === currentSongIndex;
    icon.className = `fa-solid ${isCurrent && !song.paused ? "fa-pause" : "fa-play"}`;
  });
}

function updateSongInfo() {
  const combined = getCombinedSongs();
  const selectedSong = combined[currentSongIndex] || combined[0] || {};
  songName.textContent = selectedSong.title || "Unknown";
  artistName.textContent = selectedSong.artist || "Unknown";
  rotatingImage.src = selectedSong.cover || rotatingImage.src;
  renderSongs();
  updatePlaybackIcons();
}

function renderArtists() {
  if (!artistContainer) return;
  artistContainer.innerHTML = artists
    .map(
      (artist) => `
      <div class="artist">
        <div class="artist-img-container">
          <img src="${artist.image}" alt="${artist.name}" />
        </div>
        <p>${artist.name}</p>
      </div>
    `
    )
    .join("");
}

function renderAlbums() {
  if (!albumContainer) return;
  albumContainer.innerHTML = albums
    .map(
      (album) => `
      <div class="album">
        <div class="album-frame">
          <img src="${album.cover}" alt="${album.title}" />
        </div>
        <div>
          <h2>${album.title}</h2>
          <p>${album.artist}</p>
        </div>
      </div>
    `
    )
    .join("");
}

function getSectionSongs() {
  const combined = getCombinedSongs();
  const indexedSongs = combined.map((songItem, index) => ({ ...songItem, index }));
  const section = currentSection || "discover";

  switch (section) {
    case "trending":
      return indexedSongs.slice(0, 5);
    case "favorites":
      return [indexedSongs[0], indexedSongs[1], indexedSongs[4]].filter(Boolean);
    case "playlist":
      return indexedSongs;
    case "discover":
    default:
      return indexedSongs;
  }
}

const sectionConfig = {
  discover: {
    title: "Popular Playlist",
    subtitle: "Recommended Songs",
    description: "Browse music, artists, albums, and playlists from the Discover section.",
    show: {
      slider: true,
      artists: true,
      albums: true,
      recommended: true,
      player: true,
      placeholder: false,
    },
  },
  trending: {
    title: "Trending",
    subtitle: "Trending Songs",
    description: "Catch the hottest tracks and trending playlists right now.",
    show: {
      slider: true,
      artists: false,
      albums: false,
      recommended: true,
      player: true,
      placeholder: false,
    },
  },
  albums: {
    title: "Albums",
    subtitle: "Recommended Albums",
    description: "Explore the latest albums and discover new favorites.",
    show: {
      slider: true,
      artists: false,
      albums: true,
      recommended: false,
      player: true,
      placeholder: false,
    },
  },
  playlist: {
    title: "Playlist",
    subtitle: "Your Playlist",
    description: "Play your music collection and manage your queue from here.",
    show: {
      slider: false,
      artists: false,
      albums: false,
      recommended: true,
      player: true,
      placeholder: false,
    },
  },
  favorites: {
    title: "Favorites",
    subtitle: "Favorite Songs",
    description: "Your liked songs and favorite playlists appear here.",
    show: {
      slider: false,
      artists: false,
      albums: false,
      recommended: true,
      player: true,
      placeholder: false,
    },
  },
  account: {
    title: "Account",
    subtitle: "Account Settings",
    description: "Manage your profile, subscriptions, and music preferences.",
    show: {
      slider: false,
      artists: false,
      albums: false,
      recommended: false,
      player: false,
      placeholder: true,
    },
  },
  settings: {
    title: "Settings",
    subtitle: "App Settings",
    description: "Update app preferences, theme options, and notifications.",
    show: {
      slider: false,
      artists: false,
      albums: false,
      recommended: false,
      player: false,
      placeholder: true,
    },
  },
  logout: {
    title: "Logout",
    subtitle: "You have been logged out",
    description: "Thanks for using Blue-Player. Please refresh to log in again.",
    show: {
      slider: false,
      artists: false,
      albums: false,
      recommended: false,
      player: false,
      placeholder: true,
    },
  },
};

function setAppSection(section) {
  currentSection = section;
  const config = sectionConfig[section] || sectionConfig.discover;
  sliderContainer.style.display = config.show.slider ? "" : "none";
  artistsSection.style.display = config.show.artists ? "" : "none";
  albumsSection.style.display = config.show.albums ? "" : "none";
  recommendedSection.style.display = config.show.recommended ? "" : "none";
  musicPlayer.style.display = config.show.player ? "" : "none";
  sectionPlaceholder.classList.toggle("hidden", !config.show.placeholder);

  const titleElement = document.querySelector(".slider-container h1");
  if (titleElement) {
    titleElement.textContent = config.title;
  }

  const recommendedTitle = recommendedSection.querySelector("h1");
  if (recommendedTitle) {
    recommendedTitle.textContent = config.subtitle;
  }

  const message = sectionPlaceholder.querySelector(".section-message");
  if (message) {
    message.innerHTML = `<h2>${config.title}</h2><p>${config.description}</p>`;
  }

  renderArtists();
  renderAlbums();
  renderSongs();
}

function renderSongs() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleSongs = getSectionSongs().filter(({ title, artist }) =>
    `${title} ${artist}`.toLowerCase().includes(query)
  );

  if (!visibleSongs.length) {
    songContainer.innerHTML = '<div class="song-empty">No songs matched your search.</div>';
    return;
  }

  songContainer.innerHTML = visibleSongs
    .map(({ title, artist, cover, duration, index }) => {
      const isCurrent = index === currentSongIndex;
      const iconClass = isCurrent && !song.paused ? "fa-pause" : "fa-play";

      return `
      <div class="song ${isCurrent ? "active" : ""}" data-song-index="${index}">
        <div class="song-img">
          <img src="${cover}" alt="${title}" />
          <div class="overlay">
            <i class="fa-solid ${iconClass}"></i>
          </div>
        </div>
        <div class="song-title">
          <h2>${title}</h2>
          <p>${artist}</p>
        </div>
        <span>${duration}</span>
      </div>
    `;
    })
    .join("");

  bindSongEvents();
}

function bindSongEvents() {
  document.querySelectorAll(".song").forEach((songItem) => {
    songItem.addEventListener("click", () => {
      playSong(Number(songItem.dataset.songIndex), true);
    });
  });
}

function loadCurrentSong(startPlaying = false) {
  const combined = getCombinedSongs();
  const selectedSong = combined[currentSongIndex] || combined[0] || {};
  song.src = selectedSong.source || "";
  song.load();
  updateSongInfo();

  if (startPlaying) {
    const startPlayback = () => {
      const playPromise = song.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    if (song.readyState >= 2) {
      startPlayback();
    } else {
      song.addEventListener("canplay", startPlayback, { once: true });
    }
  }
}

function playSong(index, shouldPlay = true) {
  currentSongIndex = index;
  loadCurrentSong(shouldPlay);
  setPlaybackState(shouldPlay);
}

function setPlaybackState(isPlaying) {
  controlIcon.classList.toggle("fa-pause", isPlaying);
  controlIcon.classList.toggle("fa-play", !isPlaying);

  if (isPlaying) {
    startRotation();
  } else {
    pauseRotation();
  }
}

function playPause() {
  if (song.paused) {
    loadCurrentSong(true);
    setPlaybackState(true);
  } else {
    song.pause();
    setPlaybackState(false);
  }
}

function getNextSongIndex() {
  if (isShuffled) {
    let nextIndex = currentSongIndex;
    const len = getCombinedSongs().length || 1;
    while (nextIndex === currentSongIndex) {
      nextIndex = Math.floor(Math.random() * len);
    }
    return nextIndex;
  }

  const len = getCombinedSongs().length || 1;
  return (currentSongIndex + 1) % len;
}

function getPreviousSongIndex() {
  if (isShuffled) {
    let nextIndex = currentSongIndex;
    const len = getCombinedSongs().length || 1;
    while (nextIndex === currentSongIndex) {
      nextIndex = Math.floor(Math.random() * len);
    }
    return nextIndex;
  }

  const len = getCombinedSongs().length || 1;
  return (currentSongIndex - 1 + len) % len;
}

song.addEventListener("loadedmetadata", function () {
  progress.max = song.duration || 0;
  durationLabel.textContent = formatTime(song.duration);
  progress.value = 0;
  currentTimeLabel.textContent = "0:00";
});

song.addEventListener("play", updatePlaybackIcons);
song.addEventListener("pause", updatePlaybackIcons);

song.addEventListener("timeupdate", function () {
  progress.value = song.currentTime;
  currentTimeLabel.textContent = formatTime(song.currentTime);
});

song.addEventListener("ended", function () {
  if (isRepeating) {
    playSong(currentSongIndex, true);
  } else {
    playSong(getNextSongIndex(), true);
  }
});

song.addEventListener("error", function () {
  console.warn("Audio playback error for track", currentSongIndex, song.error);
  const failedTitle = (songName && songName.textContent) || "Unknown";
  const len = getCombinedSongs().length || 0;
  if (len > 1) {
    const next = getNextSongIndex();
    if (next === currentSongIndex) {
      // nothing else to try
      song.pause();
      setPlaybackState(false);
      console.warn("No alternative track to play after failure:", failedTitle);
    } else {
      console.warn("Skipping to next track after error:", next);
      playSong(next, true);
    }
  } else {
    song.pause();
    setPlaybackState(false);
    console.warn("Failed to load track and no other tracks available:", failedTitle);
  }
});

song.addEventListener("stalled", function () {
  console.warn("Audio stalled for track", currentSongIndex);
});

playPauseButton.addEventListener("click", playPause);

progress.addEventListener("input", function () {
  song.currentTime = Number(progress.value) || 0;
  currentTimeLabel.textContent = formatTime(song.currentTime);
});

progress.addEventListener("change", function () {
  song.currentTime = Number(progress.value) || 0;
  if (song.paused) {
    loadCurrentSong(true);
    setPlaybackState(true);
  }
});

forwardButton.addEventListener("click", function () {
  playSong(getNextSongIndex(), true);
});

backwardButton.addEventListener("click", function () {
  playSong(getPreviousSongIndex(), true);
});

shuffleButton.addEventListener("click", function () {
  isShuffled = !isShuffled;
  shuffleButton.classList.toggle("active", isShuffled);
});

repeatButton.addEventListener("click", function () {
  isRepeating = !isRepeating;
  repeatButton.classList.toggle("active", isRepeating);
});

volumeSlider.addEventListener("input", function () {
  const volume = Number(volumeSlider.value);
  song.volume = volume;
  if (volume > 0) {
    song.muted = false;
    previousVolume = volume;
  }
  updateVolumeIcon(volume);
});

volumeIcon.addEventListener("click", function () {
  if (song.muted || song.volume === 0) {
    song.muted = false;
    song.volume = previousVolume || 0.8;
    volumeSlider.value = song.volume;
  } else {
    song.muted = true;
    previousVolume = song.volume;
    volumeSlider.value = 0;
  }
  updateVolumeIcon(song.volume);
});

searchInput.addEventListener("input", renderSongs);

document.querySelectorAll(".slide-overlay button").forEach((button, index) => {
  button.addEventListener("click", () => {
    let trackIndex = Number(button.dataset.track ?? index);
    // If user-added songs exist, bundled tracks are offset by their count
    trackIndex = trackIndex + (userSongs.length || 0);
    playSong(trackIndex, true);
  });
});

updateVolumeIcon(Number(volumeSlider.value));
renderSongs();
setAppSection("discover");
loadCurrentSong(false);

// Slider

var swiper = new Swiper(".swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  loop: true,
  speed: 600,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 10,
    stretch: 120,
    depth: 200,
    modifier: 1,
    slideShadows: false,
  },
  on: {
    click(event) {
      swiper.slideTo(this.clickedIndex);
    },
  },
  pagination: {
    el: ".swiper-pagination",
  },
});
