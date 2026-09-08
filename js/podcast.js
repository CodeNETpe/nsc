/* NSC · Podcast v2. Controles propios sobre un único elemento de audio. */
(function () {
  'use strict';

  function initPodcast() {
    var section = document.getElementById('podcast');
    if (!section) return;
    function element(id) { return document.getElementById(id); }
    var audio = element('nscPodcastAudio');
    var title = element('nscPodcastTitle');
    var label = element('nscPodcastLabel');
    var status = element('nscPodcastStatus');
    var state = element('nscPodcastState');
    var counter = element('nscPodcastCounter');
    var featuredButton = element('nscPodcastFeatured');
    var custom = element('nscPodcastCustom');
    var controls = {
      toggle: element('nscPodcastToggle'), icon: element('nscPodcastToggleIcon'),
      prev: element('nscPodcastPrev'), next: element('nscPodcastNext'),
      back: element('nscPodcastBack'), forward: element('nscPodcastForward'),
      seek: element('nscPodcastSeek'), elapsed: element('nscPodcastElapsed'),
      total: element('nscPodcastTotal'), mute: element('nscPodcastMute'),
      volume: element('nscPodcastVolume'), speed: element('nscPodcastSpeed'),
      speedLabel: element('nscPodcastSpeedLabel')
    };
    if (!audio || !title || !label || !status || !custom ||
        Object.keys(controls).some(function (key) { return !controls[key]; })) return;

    var featured = { id: 'destacado', src: audio.getAttribute('src'), title: title.textContent.trim(), tone: 'red' };
    var episodes = Array.prototype.slice.call(section.querySelectorAll('[data-podcast-episode]')).map(function (link) {
      return {
        id: link.getAttribute('data-podcast-episode'), src: link.getAttribute('href'),
        title: link.querySelector('[data-podcast-title]').textContent.trim(),
        tone: link.getAttribute('data-podcast-tone') || 'red', link: link
      };
    });
    var queue = [featured].concat(episodes);
    var current = featured;
    var requestNumber = 0;
    var waiting = false;
    var interacted = false;
    var scrubbing = false;
    var playError = '';
    var selectedRate = 1;
    var lastVolume = audio.volume || 1;
    var rates = [1, 1.25, 1.5, 2, 0.75];

    function duration() { return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0; }
    function formatTime(value) {
      var seconds = Math.max(0, Math.floor(isFinite(value) ? value : 0));
      return Math.floor(seconds / 60) + ':' + (seconds % 60 < 10 ? '0' : '') + seconds % 60;
    }
    function currentIndex() { return queue.indexOf(current); }
    function updateTimeline() {
      var end = duration();
      var time = Math.max(0, Math.min(audio.currentTime || 0, end || 0));
      controls.seek.disabled = !end || !!audio.error;
      controls.back.disabled = controls.forward.disabled = !end || !!audio.error;
      controls.seek.max = end || 1;
      if (!scrubbing) controls.seek.value = time;
      controls.seek.style.setProperty('--fill', (end ? Number(controls.seek.value) / end * 100 : 0) + '%');
      controls.seek.setAttribute('aria-valuetext', formatTime(time) + ' de ' + formatTime(end));
      controls.elapsed.textContent = formatTime(time);
      controls.total.textContent = end ? formatTime(end) : '--:--';
      if (end && current.link) {
        var text = current.link.querySelector('[data-podcast-duration]');
        if (text) text.textContent = formatTime(end);
      }
    }
    function updateVolume() {
      var silent = audio.muted || audio.volume === 0;
      var value = silent ? 0 : audio.volume;
      controls.volume.value = value;
      controls.volume.style.setProperty('--fill', value * 100 + '%');
      controls.volume.setAttribute('aria-valuetext', Math.round(value * 100) + ' por ciento');
      controls.mute.setAttribute('aria-pressed', silent ? 'true' : 'false');
      controls.mute.setAttribute('aria-label', silent ? 'Reactivar sonido' : 'Silenciar audio');
      controls.mute.title = silent ? 'Reactivar sonido' : 'Silenciar';
      controls.mute.querySelector('i').className = 'fa-solid ' + (silent ? 'fa-volume-xmark' : value < .5 ? 'fa-volume-low' : 'fa-volume-high');
    }
    function updateSpeed() {
      selectedRate = audio.playbackRate;
      var text = String(selectedRate).replace('.', ',');
      controls.speedLabel.textContent = text + '×';
      controls.speed.setAttribute('aria-label', 'Velocidad: ' + text + ' veces. Pulsar para cambiar.');
    }
    function render() {
      var failed = !!audio.error || !!playError;
      var playing = !audio.paused && !audio.ended && !failed;
      var loading = waiting && !failed;
      section.classList.toggle('is-playing', playing && !loading);
      section.classList.toggle('is-loading', loading);
      section.classList.toggle('has-error', failed);
      controls.icon.className = 'fa-solid ' + (loading ? 'fa-spinner' : failed || audio.ended ? 'fa-rotate-right' : playing ? 'fa-pause' : 'fa-play');
      controls.toggle.setAttribute('aria-label', failed ? 'Reintentar reproducción' : playing || loading ? 'Pausar episodio' : audio.ended ? 'Volver a reproducir el episodio' : 'Reproducir episodio');
      controls.toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
      controls.prev.disabled = currentIndex() === 0;
      controls.next.disabled = currentIndex() === queue.length - 1;
      episodes.forEach(function (episode) {
        var active = episode === current;
        var on = active && playing;
        episode.link.classList.toggle('is-current', active);
        episode.link.classList.toggle('is-playing', on && !loading);
        episode.link.setAttribute('aria-pressed', on ? 'true' : 'false');
        episode.link.setAttribute('aria-label', (on ? 'Pausar ' : 'Reproducir ') + episode.title + '. Demostración con voz de IA.');
        var icon = episode.link.querySelector('[data-podcast-icon]');
        if (icon) icon.className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
      });
      if (featuredButton) featuredButton.setAttribute('aria-pressed', current === featured && playing ? 'true' : 'false');
      if (counter) counter.textContent = String(currentIndex() + 1).padStart(2, '0') + ' / ' + String(queue.length).padStart(2, '0');
      var phase = failed ? 'No disponible' : loading ? 'Cargando' : playing ? 'Reproduciendo' : audio.ended ? 'Finalizado' : interacted ? 'En pausa' : 'Listo';
      if (state) state.textContent = phase;
      status.textContent = failed ? (playError || 'No se pudo cargar el audio. Pulsa reintentar o elige otro episodio.') :
        loading ? 'Preparando el audio…' : playing ? 'Reproduciendo · ' + current.title :
        audio.ended ? 'Episodio finalizado. Puedes repetirlo o elegir otro.' :
        interacted ? 'En pausa · ' + current.title : 'Pulsa reproducir o elige un episodio de la lista.';
      updateTimeline();
    }
    function pause() {
      requestNumber++;
      waiting = false;
      audio.pause();
      render();
    }
    function play() {
      interacted = true;
      playError = '';
      if (audio.error) audio.load();
      if (audio.ended) audio.currentTime = 0;
      waiting = true;
      var request = ++requestNumber;
      try {
        var promise = audio.play();
        render();
        if (promise && typeof promise.catch === 'function') {
          promise.then(function () {
            if (request !== requestNumber) return;
            waiting = !audio.paused && audio.readyState < 3;
            render();
          }).catch(function (error) {
            if (request !== requestNumber || error.name === 'AbortError') return;
            waiting = false;
            playError = error.name === 'NotAllowedError' ? 'Pulsa de nuevo reproducir para autorizar el audio.' : 'No se pudo reproducir. Comprueba tu conexión y vuelve a intentarlo.';
            render();
          });
        }
      } catch (error) {
        waiting = false;
        playError = 'No se pudo iniciar el audio. Puedes abrir el MP3 desde el enlace de la lista.';
        render();
      }
    }
    function toggle() {
      interacted = true;
      if ((!audio.paused || waiting) && !audio.ended && !audio.error) pause(); else play();
    }
    function selectEpisode(episode) {
      if (!episode) return;
      if (episode === current) { toggle(); return; }
      requestNumber++;
      waiting = false;
      playError = '';
      audio.pause();
      current = episode;
      title.textContent = episode.title;
      label.textContent = episode === featured ? 'Episodio destacado' : 'Ahora seleccionado';
      section.setAttribute('data-podcast-tone', episode.tone);
      audio.setAttribute('aria-label', 'Podcast NSC: ' + episode.title);
      audio.src = episode.src;
      audio.load();
      audio.defaultPlaybackRate = selectedRate;
      audio.playbackRate = selectedRate;
      render();
      play();
    }
    function seekTo(value) {
      if (!duration() || audio.error) return;
      try { audio.currentTime = Math.max(0, Math.min(value, duration())); } catch (error) { return; }
      updateTimeline();
    }

    controls.toggle.addEventListener('click', toggle);
    controls.prev.addEventListener('click', function () { selectEpisode(queue[currentIndex() - 1]); });
    controls.next.addEventListener('click', function () { selectEpisode(queue[currentIndex() + 1]); });
    controls.back.addEventListener('click', function () { seekTo(audio.currentTime - 10); });
    controls.forward.addEventListener('click', function () { seekTo(audio.currentTime + 10); });
    controls.seek.addEventListener('pointerdown', function () { scrubbing = true; });
    controls.seek.addEventListener('input', function () { seekTo(Number(controls.seek.value)); });
    controls.seek.addEventListener('change', function () { scrubbing = false; updateTimeline(); });
    document.addEventListener('pointerup', function () { if (scrubbing) { scrubbing = false; updateTimeline(); } }, { passive: true });
    document.addEventListener('pointercancel', function () { scrubbing = false; updateTimeline(); }, { passive: true });
    controls.volume.addEventListener('input', function () {
      var value = Math.max(0, Math.min(1, Number(controls.volume.value)));
      if (value > 0) lastVolume = value;
      audio.volume = value;
      audio.muted = value === 0;
      updateVolume();
    });
    controls.mute.addEventListener('click', function () {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        if (audio.volume === 0) audio.volume = lastVolume || 1;
      } else { audio.muted = true; }
      updateVolume();
    });
    controls.speed.addEventListener('click', function () {
      selectedRate = rates[(rates.indexOf(audio.playbackRate) + 1) % rates.length];
      audio.defaultPlaybackRate = selectedRate;
      audio.playbackRate = selectedRate;
      updateSpeed();
    });
    episodes.forEach(function (episode) {
      episode.link.setAttribute('role', 'button');
      episode.link.setAttribute('aria-controls', 'nscPodcastAudio');
      episode.link.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        selectEpisode(episode);
      });
      episode.link.addEventListener('keydown', function (event) {
        if (event.key === ' ') { event.preventDefault(); episode.link.click(); }
      });
    });
    if (featuredButton) {
      featuredButton.hidden = false;
      featuredButton.addEventListener('click', function () { selectEpisode(featured); });
    }

    audio.addEventListener('loadedmetadata', function () { updateTimeline(); render(); });
    audio.addEventListener('durationchange', updateTimeline);
    audio.addEventListener('timeupdate', updateTimeline);
    audio.addEventListener('play', function () { interacted = true; waiting = audio.readyState < 3; render(); });
    audio.addEventListener('playing', function () { waiting = false; playError = ''; render(); });
    audio.addEventListener('pause', function () { if (audio.paused) { waiting = false; render(); } });
    audio.addEventListener('waiting', function () { if (!audio.paused) { waiting = true; render(); } });
    audio.addEventListener('canplay', function () { if (!audio.paused) { waiting = false; render(); } });
    audio.addEventListener('seeked', function () { waiting = !audio.paused && audio.readyState < 3; render(); });
    audio.addEventListener('ended', function () { if (audio.ended) { waiting = false; render(); } });
    audio.addEventListener('error', function () { if (audio.error) { waiting = false; render(); } });
    audio.addEventListener('volumechange', updateVolume);
    audio.addEventListener('ratechange', updateSpeed);

    // En dispositivos que reservan el volumen al sistema, el botón de silencio sigue disponible.
    try {
      var initialVolume = audio.volume;
      audio.volume = .75;
      if (Math.abs(audio.volume - .75) > .01) {
        controls.volume.hidden = true;
        controls.mute.title = 'Usa los botones del dispositivo para ajustar el volumen';
      }
      audio.volume = initialVolume;
    } catch (error) { controls.volume.hidden = true; }

    // Mejora progresiva: sin JS quedan el control nativo y los enlaces directos a los MP3.
    custom.hidden = false;
    audio.controls = false;
    audio.hidden = true;
    section.classList.add('is-enhanced');
    updateVolume();
    updateSpeed();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPodcast, { once: true });
  } else { initPodcast(); }
})();
