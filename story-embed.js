(function () {
  console.log('Embed script loaded');

  // Configuration for the carousel
  window.MyVideoCarouselConfig = window.MyVideoCarouselConfig || {
    playButtonColor: '#0000FF',
    integrationId: null, // Default value, should be set by the customer
    numVideos: 3, // Default value for number of videos
  };

  const supabaseUrl = 'https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/integrations';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmN4bHF3ZmZkcnFjd2dnb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyNjY2NTYsImV4cCI6MTk4ODg0MjY1Nn0.lha9G8j7lPLVGv0IU1sAT4SzrJb0I87LfhhvQV8Tc2Q';  // Add your actual key

  // Fetch video IDs from the integrations table
  async function fetchVideoIds(integrationId, numVideos) {
    try {
      const response = await fetch(`${supabaseUrl}?id=eq.${integrationId}`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.length > 0) {
        const integrationData = data[0];
        const videoIds = [];
        for (let i = 1; i <= numVideos; i++) {
          if (integrationData[`vid${i}`]) {
            videoIds.push(integrationData[`vid${i}`]);
          }
        }
        window.MyVideoCarouselConfig.videoIds = videoIds;
        fetchVideoDetails(videoIds);  // Fetch detailed video info and render carousel
      } else {
        console.error('No data found for the specified integration ID');
      }
    } catch (error) {
      console.error('Error fetching video IDs:', error);
    }
  }

  // Fetch video details from hostedSubs table
  async function fetchVideoDetails(videoIds) {
    try {
      const response = await fetch(`https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/hostedSubs?id=in.(${videoIds.join(',')})&select=playback_id,title,thumbnail`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const videoData = await response.json();
      if (videoData.length > 0) {
        renderCarousel(videoData); // Render the carousel with the fetched video data
      } else {
        console.error('No videos found in hostedSubs');
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  }

  // Render the carousel of video thumbnails
  function renderCarousel(videoData) {
    const container = document.getElementById('carousel-container');
    if (!container) {
      console.error('Carousel container not found');
      return;
    }

    container.innerHTML = '';  // Clear any previous content

    videoData.forEach((video, index) => {
      const storyDiv = document.createElement('div');
      storyDiv.className = 'carousel-item';
      storyDiv.id = `story-${index + 1}`;

      const storyImageDiv = document.createElement('div');
      storyImageDiv.className = 'story-image';

      const img = document.createElement('img');
      img.src = video.thumbnail || '';  // Use the video thumbnail
      img.alt = video.title || 'Untitled Video';  // Use the video title for the alt text

      const playButtonOverlay = document.createElement('div');
      playButtonOverlay.className = 'play-button-overlay';
      playButtonOverlay.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      `;

      storyImageDiv.appendChild(img);
      storyImageDiv.appendChild(playButtonOverlay);
      storyDiv.appendChild(storyImageDiv);

      container.appendChild(storyDiv);

      // Attach click event to each story thumbnail
      storyDiv.addEventListener('click', () => openOverlay(index, videoData));
    });
  }

  // Open the video overlay
  function openOverlay(index, videoData) {
    const overlay = document.getElementById('fullscreen-overlay');
    const muxPlayer = overlay.querySelector('mux-player');
    const video = videoData[index];

    overlay.style.display = 'flex';
    muxPlayer.setAttribute('playback-id', video.playback_id);
    muxPlayer.setAttribute('metadata-video-title', video.title || 'Untitled Video');  // Always set title from hostedSubs
    muxPlayer.load();
    muxPlayer.play();
  }

  // Close the overlay
  function closeOverlay() {
    const overlay = document.getElementById('fullscreen-overlay');
    const muxPlayer = overlay.querySelector('mux-player');
    muxPlayer.pause();
    overlay.style.display = 'none';
  }

  // Initialize the overlay and carousel structure
  function initializeCarousel() {
    const container = document.createElement('div');
    container.id = 'carousel-container';
    document.body.appendChild(container);

    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.id = 'fullscreen-overlay';
    overlay.innerHTML = `
      <mux-player
        class="fullscreen-video"
        playback-id=""
        metadata-viewer-user-id="user"
        accent-color="${window.MyVideoCarouselConfig.playButtonColor}"
      ></mux-player>
      <div class="close-button" tabindex="0" aria-label="Close dialog" role="button">
        <span class="close-button-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0002 10.586L4.70718 3.29297L3.29297 4.70718L10.586 12.0002L3.29297 19.2933L4.70718 20.7075L12.0002 13.4145L19.2933 20.7075L20.7075 19.2933L13.4145 12.0002L20.7075 4.70723L19.2933 3.29302L12.0002 10.586Z" fill="white"></path>
          </svg>
        </span>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.style.display = 'none';

    document.querySelector('.close-button').addEventListener('click', closeOverlay);
    document.getElementById('fullscreen-overlay').addEventListener('click', (e) => {
      if (!e.target.closest('.fullscreen-video-container')) {
        closeOverlay();
      }
    });
  }

  // Start the process by fetching video IDs and initializing the carousel
  const integrationId = window.MyVideoCarouselConfig.integrationId;
  const numVideos = window.MyVideoCarouselConfig.numVideos;

  if (integrationId) {
    initializeCarousel();
    fetchVideoIds(integrationId, numVideos);
  } else {
    console.error('Integration ID is not specified in the configuration');
  }
})();
