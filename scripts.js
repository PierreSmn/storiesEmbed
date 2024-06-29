function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function initializeCarousel(config) {
  const integrationId = config.integrationId || '26';
  const titles = [
    config.title1 || 'Story 1',
    config.title2 || 'Story 2',
    config.title3 || 'Story 3'
  ];

  window.MyVideoCarouselConfig = {
    playButtonColor: '#0000FF',
    integrationId: integrationId,
    numVideos: 3 // Only fetch the first 3 videos
  };
  let data = [];
  let currentIndex = 0;

  async function fetchData() {
    const supabaseUrl = `https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/integrations?id=eq.${window.MyVideoCarouselConfig.integrationId}&select=vid1,vid2,vid3`;
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmN4bHF3ZmZkcnFjd2dnb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyNjY2NTYsImV4cCI6MTk4ODg0MjY1Nn0.lha9G8j7lPLVGv0IU1sAT4SzrJb0I87LfhhvQV8Tc2Q';
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    const integrationData = await response.json();
    const videoIds = [integrationData[0].vid1, integrationData[0].vid2, integrationData[0].vid3];
    const videosResponse = await fetch(`https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/hostedSubs?id=in.(${videoIds.join(',')})&select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    data = await videosResponse.json();
    renderCarousel();
  }

  function renderCarousel() {
    const root = document.getElementById('carousel-root');
    root.innerHTML = `
      <div class="story-container" id="stories">
        ${titles.map((title, index) => `
          <div class="story" id="story-${index + 1}">
            <div class="story-image">
              <img src="" alt="${title} Thumbnail">
              <div class="play-button-overlay">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </div>
            </div>
            <div class="story-title" id="title-${index + 1}">${title}</div>
          </div>
        `).join('')}
      </div>

      <div class="fullscreen-overlay" id="fullscreen-overlay">
        <div class="fullscreen-video-container">
          <mux-player class="fullscreen-video" playback-id="" metadata-video-title="" metadata-viewer-user-id="user" autoplay></mux-player>
          <div class="close-button" id="close-overlay" tabindex="0" aria-label="Close dialog" role="button">
            <span class="close-button-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0002 10.586L4.70718 3.29297L3.29297 4.70718L10.586 12.0002L3.29297 19.2933L4.70718 20.7075L12.0002 13.4145L19.2933 20.7075L20.7075 19.2933L13.4145 12.0002L20.7075 4.70723L19.2933 3.29302L12.0002 10.586Z" fill="white"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    `;

    const stories = document.querySelectorAll('.story');
    stories.forEach((story, index) => {
      const img = story.querySelector('img');
      img.src = data[index].thumbnail;
      story.addEventListener('click', () => openOverlay(index));
      story.querySelector('.play-button-overlay').addEventListener('click', (e) => {
        e.stopPropagation();
        openOverlay(index);
      });
    });
  }

  function openOverlay(index) {
    currentIndex = index;
    const overlay = document.getElementById('fullscreen-overlay');
    const muxPlayer = overlay.querySelector('mux-player');
    const video = data[currentIndex];
    overlay.style.display = 'flex';
    muxPlayer.setAttribute('playback-id', video.playback_id);
    muxPlayer.setAttribute('metadata-video-title', video.title);
    muxPlayer.setAttribute('metadata-viewer-user-id', 'user');
    muxPlayer.load();
    muxPlayer.addEventListener('loadeddata', function () {
      muxPlayer.play();
    });
    muxPlayer.removeEventListener('ended', playNextVideo);
    muxPlayer.addEventListener('ended', playNextVideo);
  }

  function playNextVideo() {
    currentIndex = (currentIndex + 1) % data.length;
    openOverlay(currentIndex);
  }

  function playPreviousVideo() {
    currentIndex = (currentIndex - 1 + data.length) % data.length;
    openOverlay(currentIndex);
  }

  function closeOverlay() {
    const overlay = document.getElementById('fullscreen-overlay');
    const muxPlayer = overlay.querySelector('mux-player');
    muxPlayer.pause();
    overlay.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    if (e.target.matches('.close-button, .close-button *')) {
      closeOverlay();
    } else if (e.target.matches('#fullscreen-overlay')) {
      if (!e.target.closest('.fullscreen-video-container')) {
        closeOverlay();
      }
    }
  });

  fetchData();
}

if (window.MyVideoCarouselConfig) {
  initializeCarousel(window.MyVideoCarouselConfig);
} else {
  window.addEventListener('load', () => {
    if (window.MyVideoCarouselConfig) {
      initializeCarousel(window.MyVideoCarouselConfig);
    }
  });
}
