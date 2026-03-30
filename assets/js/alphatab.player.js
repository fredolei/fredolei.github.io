// initialize alphatab
const wrapper = document.querySelector(".at-wrap");
const main = wrapper.querySelector(".at-main");
const filePath = document.getElementById("alphaTabWrapper").dataset.tabFile;

const settings = {
    file: filePath,
    player: {
        enablePlayer: true,
        soundFont: "/assets/soundfonts/font.sf2",
        scrollElement: wrapper.querySelector('.at-viewport')
    },
};
const api = new alphaTab.AlphaTabApi(main, settings);

// overlay logic
const overlay = wrapper.querySelector(".at-overlay");
api.renderStarted.on(() => {
    overlay.style.display = "flex";
});
api.renderFinished.on(() => {
    overlay.style.display = "none";
});

// implement track selector
function createTrackItem(track) {
    const trackItem = document.querySelector("#at-track-template").content.cloneNode(true).firstElementChild;
    const icon = trackItem.querySelector(".at-track-icon i");
    const name = track.name.toLowerCase();

    // Assign Icons based on Name or Program ID
    if (name.includes('guitar')) {
        icon.className = "fas fa-guitar";
    } else if (name.includes('bass')) {
        icon.className = "fas fa-wave-square";
    } else if (name.includes('drum') || name.includes('percussion')) {
        icon.className = "fas fa-drum";
    } else if (name.includes('piano') || name.includes('keyboard')) {
        icon.className = "fas fa-keyboard";
    } else if (name.includes('vocal') || name.includes('voice')) {
        icon.className = "fas fa-microphone";
    } else if (track.programId !== undefined) {
        if (track.programId >= 0 && track.programId <= 7) icon.className = "fas fa-keyboard";
        else if (track.programId >= 24 && track.programId <= 31) icon.className = "fas fa-guitar";
        else if (track.programId >= 32 && track.programId <= 39) icon.className = "fas fa-bolt";
        else icon.className = "fas fa-music";
    } else {
        icon.className = "fas fa-music";
    }
    
    trackItem.querySelector(".at-track-name").innerText = track.name;
    trackItem.track = track;

    // Track Selection Click
    trackItem.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.at-track').forEach(el => el.classList.remove('active'));
        trackItem.classList.add('active');
        api.renderTracks([track]);
    };

    // Mute Button
    const muteBtn = trackItem.querySelector(".at-track-mute");
    muteBtn.onclick = (e) => {
        e.stopPropagation();
        const isMuted = !muteBtn.classList.contains("active");
        muteBtn.classList.toggle("active");
        api.changeTrackMute([track], isMuted);
    };

    // Solo Button
    const soloBtn = trackItem.querySelector(".at-track-solo");
    soloBtn.onclick = (e) => {
        e.stopPropagation();
        const isSolo = !soloBtn.classList.contains("active");
        soloBtn.classList.toggle("active");
        api.changeTrackSolo([track], isSolo);
    };

    // volume
    const trackVolSlider = trackItem.querySelector(".at-track-volume-slider");
    const trackVolContainer = trackItem.querySelector(".at-track-volume");

    // Prevent clicking the slider from selecting the track
    trackVolContainer.onclick = (e) => e.stopPropagation();
    trackVolSlider.onclick = (e) => e.stopPropagation();

    // This will now perfectly equal 0.75 for Organs, and whatever the default is for everything else
    trackVolSlider.value = track.playbackInfo.volume / 16;

    // When the user moves the slider, update the engine
    trackVolSlider.oninput = (e) => {
        api.changeTrackVolume([track], parseFloat(e.target.value));
    };

    return trackItem;
}

// score rendering
const trackList = wrapper.querySelector(".at-track-list");

api.scoreLoaded.on((score) => {
    // Update Song Info
    wrapper.querySelector(".at-song-title").innerText = score.title;
    wrapper.querySelector(".at-song-artist").innerText = score.artist;

    // Clear and Generate Tracks
    trackList.innerHTML = "";
    score.tracks.forEach((track) => {
        
        // add auto-fix for weird organ
        const isOrgan = track.playbackInfo.program === 19 || track.name.toLowerCase().includes('organ');
        if (isOrgan) {
            track.playbackInfo.program = 16; // swap to hammond
            track.playbackInfo.volume = 12;  // set to quarter volume
        }
        
        trackList.appendChild(createTrackItem(track));
    });
});

api.renderStarted.on(() => {
    const tracks = new Map();
    api.tracks.forEach((t) => tracks.set(t.index, t));
    
    const trackItems = trackList.querySelectorAll(".at-track");
    trackItems.forEach((trackItem) => {
        if (tracks.has(trackItem.track.index)) {
            trackItem.classList.add("active");
        } else {
            trackItem.classList.remove("active");
        }
    });
});

// other ui controls
const countIn = wrapper.querySelector('.at-controls .at-count-in');
countIn.onclick = () => {
    countIn.classList.toggle('active');
    api.countInVolume = countIn.classList.contains('active') ? 1 : 0;
};

const metronome = wrapper.querySelector(".at-controls .at-metronome");
metronome.onclick = () => {
    metronome.classList.toggle("active");
    api.metronomeVolume = metronome.classList.contains("active") ? 1 : 0;
};

const speedSelect = wrapper.querySelector(".at-speed-select");
speedSelect.onchange = () => {
    api.playbackSpeed = parseFloat(speedSelect.value);
};

const loop = wrapper.querySelector(".at-controls .at-loop");
loop.onclick = () => {
    loop.classList.toggle("active");
    api.isLooping = loop.classList.contains("active");
};

wrapper.querySelector(".at-controls .at-print").onclick = () => {
    api.print();
};

const zoom = wrapper.querySelector(".at-controls .at-zoom select");
zoom.onchange = () => {
    api.settings.display.scale = parseInt(zoom.value) / 100;
    api.updateSettings();
    api.render();
};

const layout = wrapper.querySelector(".at-controls .at-layout select");
layout.onchange = () => {
    api.settings.display.layoutMode = layout.value === "horizontal" 
        ? alphaTab.LayoutMode.Horizontal 
        : alphaTab.LayoutMode.Page;
    api.updateSettings();
    api.render();
};

// progress bar
const progressContainer = wrapper.querySelector(".at-progress-container");
const progressBar = wrapper.querySelector(".at-progress-bar");
let songEndTime = 0;

api.playerPositionChanged.on((e) => {
    songEndTime = e.endTime;
    const percentage = (e.currentTime / e.endTime) * 100;
    progressBar.style.width = percentage + "%";
    const viewport = document.querySelector('.at-viewport');
});

progressContainer.onclick = (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    api.timePosition = percentage * songEndTime;
};

// player load
const playerIndicator = wrapper.querySelector(".at-controls .at-player-progress");
api.soundFontLoad.on((e) => {
    const percentage = Math.floor((e.loaded / e.total) * 100);
    playerIndicator.innerText = percentage + "%";
});

api.playerReady.on(() => {
    playerIndicator.style.display = "none";
    playPause.classList.remove("disabled");
    stop.classList.remove("disabled");
});

const playPause = wrapper.querySelector(".at-controls .at-player-play-pause");
const stop = wrapper.querySelector(".at-controls .at-player-stop");

playPause.onclick = (e) => {
    if (!e.target.closest(".disabled")) api.playPause();
};

stop.onclick = (e) => {
    if (!e.target.closest(".disabled")) api.stop();
};

api.playerStateChanged.on((e) => {
    const icon = playPause.querySelector("i.fas");
    if (e.state === alphaTab.synth.PlayerState.Playing) {
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
    } else {
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    }
});

// song timer
function formatDuration(milliseconds) {
    let seconds = milliseconds / 1000;
    const minutes = (seconds / 60) | 0;
    seconds = (seconds - minutes * 60) | 0;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

const songPosition = wrapper.querySelector(".at-song-position");
let previousTime = -1;
api.playerPositionChanged.on((e) => {
    const currentSeconds = (e.currentTime / 1000) | 0;
    if (currentSeconds == previousTime) return;
    previousTime = currentSeconds;
    songPosition.innerText = formatDuration(e.currentTime) + " / " + formatDuration(e.endTime);
});