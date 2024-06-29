(function () {
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  const integrationId = getParameterByName('integrationId') || '26';
  const titles = [
    getParameterByName('title1') || 'Story 1',
    getParameterByName('title2') || 'Story 2',
    getParameterByName('title3') || 'Story 3'
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
    initializeStories();
  }

  function initializeStories() {
    const stories = document.querySelectorAll('.story');
    stories.forEach((story, index) => {
      const img = story.querySelector('img');
      img.src = data[index].thumbnail;
      const title = story.querySelector('.story-title');
      title.textContent = titles[index];
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
