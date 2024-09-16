(function() {
  console.log('Embed script loaded');

  window.MyVideoCarouselConfig = window.MyVideoCarouselConfig || {
    playButtonColor: '#0000FF',
    integrationId: null, // Default value, should be set by the customer
    numVideos: 3 // Default value
  };

  const supabaseUrl = 'https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/integrations';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmN4bHF3ZmZkcnFjd2dnb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyNjY2NTYsImV4cCI6MTk4ODg0MjY1Nn0.lha9G8j7lPLVGv0IU1sAT4SzrJb0I87LfhhvQV8Tc2Q'; // Replace with your actual Supabase key

  // Function to fetch video data from the integration ID
  async function fetchVideoData(integrationId) {
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
        return data[0];
      } else {
        console.error('No data found for the specified integration ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      return null;
    }
  }

  // Fetch video details from hostedSubs table using videoIds
  async function fetchVideoDetails(videoIds) {
    try {
      const response = await fetch(`https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/hostedSubs?id=in.(${videoIds.join(',')})&select=*`, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  }

  // Dynamically load external scripts like the Mux Player
  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Initialize the carousel and load the Mux player script
  async function initializeCarousel() {
    const integrationId = window.MyVideoCarouselConfig.integrationId;
    const numVideos = window.MyVideoCarouselConfig.numVideos;

    if (!integrationId) {
      console.error('Integration ID is not specified in the configuration');
      return;
    }

    const integrationData = await fetchVideoData(integrationId);
    if (!integrationData) {
      return;
    }

    // Fetch video IDs and titles
    const videoIds = [];
    for (let i = 1; i <= numVideos; i++) {
      if (integrationData[`vid${i}`]) {
        videoIds.push(integrationData[`vid${i}`]);
      }
    }

    // Fetch video details from hostedSubs
    const videoData = await fetchVideoDetails(videoIds);

    // Map videoDetails to include custom titles from integrationData
    const videoDetails = videoIds.map((id, index) => {
      const video = videoData.find(v => v.id === id);
      return {
        ...video,
        customTitle: integrationData[`title${index + 1}`] || video.title // Use title from integrationData
      };
    });

    window.MyVideoCarouselConfig.videoData = videoDetails;

    // Load Mux Player script FIRST, then render the carousel after it's fully loaded
    loadScript('https://unpkg.com/@mux/mux-player@latest', function() {
      console.log('Mux Player script loaded');
      renderCarousel(); // Only render the carousel after the Mux player script is loaded
    });

    // Load external CSS for styles
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://stories-embed.vercel.app/styles.css';
    document.head.appendChild(link);

    // Prepare carousel container and overlay
    var container = document.createElement('div');
    container.className = 'story-container';
    container.id = 'stories';
    document.getElementById('story-player-container').appendChild(container);

    var overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.id = 'fullscreen-overlay';
    overlay.innerHTML = `
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

  // Render the carousel with fetched video data
  function renderCarousel() {
    const container = document.getElementById('stories');
    const { videoData } = window.MyVideoCarouselConfig;

    console.log('Video Data:', videoData);

    videoData.forEach((video, index) => {
      console.log(`Creating story for video: ${video.customTitle}`);
      const storyDiv = document.createElement('div');
      storyDiv.className = 'story';
      storyDiv.id = `story-${index + 1}`;

      const storyImageDiv = document.createElement('div');
      storyImageDiv.className = 'story-image';

      const img = document.createElement('img');
      img.src = video.thumbnail;
      img.alt = video.customTitle; // Use the custom title for the alt attribute

      const playButtonOverlay = document.createElement('div');
      playButtonOverlay.className = 'play-button-overlay';
      playButtonOverlay.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      `;

      storyImageDiv.appendChild(img);
      storyImageDiv.appendChild(playButtonOverlay);
      storyDiv.appendChild(storyImageDiv);

      const titleDiv = document.createElement('div');
      titleDiv.className = 'story-title';
      titleDiv.textContent = video.customTitle; // Use custom title from integrationData

      storyDiv.appendChild(titleDiv);
      container.appendChild(storyDiv);

      storyDiv.addEventListener('click', () => openOverlay(index));
      playButtonOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        openOverlay(index);
      });
    });
  }

  // Function to open the video overlay with Mux player
  function openOverlay(index) {
    const overlay = document.getElementById('fullscreen-overlay');
    const muxPlayer = overlay.querySelector('mux-player');
    const video = window.MyVideoCarouselConfig.videoData[index];

    // Log title and metadata
    console.log('Setting metadata-video-title:', video.customTitle);

    // Set the metadata BEFORE loading the player
    muxPlayer.setAttribute('playback-id', video.playback_id);
    muxPlayer.setAttribute('metadata-video-title', video.customTitle || 'Untitled Video'); // Use custom title
    muxPlayer.setAttribute('metadata-viewer-user-id', 'user');

    // Load the player AFTER setting metadata
    muxPlayer.load();

    // Use loadedmetadata event to ensure metadata is processed before playing
    muxPlayer.addEventListener('loadedmetadata', function () {
      console.log('Player loaded with metadata:', {
        title: muxPlayer.getAttribute('metadata-video-title'),
        playbackId: muxPlayer.getAttribute('playback-id')
      });
      muxPlayer.play(); // Play the video once metadata is fully loaded
    });

    overlay.style.display = 'flex'; // Show the overlay
  }

  // Function to close the overlay and pause the video
  function closeOverlay() {
    const overlay = document.getElementById('fullscreen-overlay');
    const muxPlayer = overlay.querySelector('mux-player');
    muxPlayer.pause();
    overlay.style.display = 'none';
  }

  // Initialize carousel on page load
  initializeCarousel();
})();
