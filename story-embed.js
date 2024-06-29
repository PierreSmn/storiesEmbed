(function () {
  // Inject styles into the head
  const style = `
    .story-container {
      display: flex;
      gap: 10px;
      padding: 20px;
      z-index: 1000;
    }

    .story {
      width: 100px;
      text-align: center;
    }

    .story-image {
      width: 100px;
      height: 100px;
      border: 4px solid #5E35B1;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      margin-bottom: 5px;
    }

    .story img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .story-title {
      color: #000;
      font-size: 14px;
    }

    .fullscreen-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }

    .fullscreen-video-container {
      position: relative;
      height: 80%;
      width: auto;
      max-width: 80%;
      background-color: #000;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    mux-player {
      aspect-ratio: 9 / 16;
      height: 100%;
      width: auto;
      max-width: 100%;
      border-radius: 16px;
      --seek-backward-button: none;
      --seek-forward-button: none;
    }

    .close-button {
      position: absolute;
      top: 10px;
      left: 10px;
      cursor: pointer;
      z-index: 20;
    }

    .close-button-icon svg {
      width: 24px;
      height: 24px;
    }

    .play-button-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      z-index: 20;
    }

    .play-button-overlay svg {
      width: 64px;
      height: 64px;
      fill: white;
      opacity: 0.7;
    }

    @media (max-width: 600px) {
      .fullscreen-video-container {
        height: 90%;
        width: 90%;
        max-width: 90%;
      }

      .close-button-icon svg {
        width: 20px;
        height: 20px;
      }
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.textContent = style;
  document.head.appendChild(styleElement);

  // Inject HTML into the body
  const html = `
    <div class="story-container" id="stories">
      <div class="story" id="story-1">
        <div class="story-image">
          <img src="" alt="Story 1 Thumbnail">
          <div class="play-button-overlay">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>
        </div>
        <div class="story-title" id="story-title-1">Story 1</div>
      </div>
      <div class="story" id="story-2">
        <div class="story-image">
          <img src="" alt="Story 2 Thumbnail">
          <div class="play-button-overlay">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>
        </div>
        <div class="story-title" id="story-title-2">Story 2</div>
      </div>
      <div class="story" id="story-3">
        <div class="story-image">
          <img src="" alt="Story 3 Thumbnail">
          <div class="play-button-overlay">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>
        </div>
        <div class="story-title" id="story-title-3">Story 3</div>
      </div>
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
  
  document.body.insertAdjacentHTML('beforeend', html);

  // Fetch and initialize stories
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      integrationId: params.get('integrationId') || '26'
    };
  }

  const { integrationId } = getQueryParams();

  window.MyVideoCarouselConfig = {
    playButtonColor: '#0000FF',
    integrationId: integrationId,
    numVideos: 3 // Only fetch the first 3 videos
  };
  
  let data = [];
  let currentIndex = 0;
  
  async function fetchData() {
    const supabaseUrl = `https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/integrations?id=eq.${window.MyVideoCarouselConfig.integrationId}&select=vid1,vid2,vid3,title1,title2,title3`;
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
    const titles = [integrationData[0].title1, integrationData[0].title2, integrationData[0].title3];

    document.getElementById('story-title-1').textContent = titles[0];
    document.getElementById('story-title-2').textContent = titles[1];
    document.getElementById('story-title-3').textContent = titles[2];

    const videosResponse = await fetch(`https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/hostedSubs?id=in.(${videoIds.join(',')})&select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    data = await videosResponse.json();
    initializeStories();
  }

  function initializeStories() {
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
  
  document.querySelector('.close-button').addEventListener('click', closeOverlay);
  document.getElementById('fullscreen-overlay').addEventListener('click', (e) => {
    if (!e.target.closest('.fullscreen-video-container')) {
      closeOverlay();
    }
  });
  
  fetchData();
})();
