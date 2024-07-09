document.addEventListener('DOMContentLoaded', () => {
  const getVideoUrl = (publisherId, campaignId) => {
    console.log(`Getting video URL for publisherId: ${publisherId}, campaignId: ${campaignId}`);
    return "3209828-uhd_3840_2160_25fps.mp4";
  };

  const initializeVideo = () => {
    const bigHeader = document.getElementById('BigHeader');
    if (bigHeader) {
      const publisherId = bigHeader.getAttribute('data-publisher-id');
      const campaignId = bigHeader.getAttribute('data-campaign-id');
      const videoSrc = getVideoUrl(publisherId, campaignId);
      return { videoSrc, publisherId, campaignId };
    }
    return null;
  };

  const videoInfo = initializeVideo();
  if (!videoInfo) {
    console.error('Failed to initialize video');
    return;
  }

  const { videoSrc, publisherId, campaignId } = videoInfo;

  let videoTime = 0;
  let videoDuration = 0;
  const playbackMilestones = [0, 0.25, 0.5, 0.75, 1];
  let reachedMilestones = new Set();

  const sendPlaybackEvent = (percentage, publisherId, campaignId) => {
    console.log(`Playback reached ${percentage * 100}% for publisherId: ${publisherId}, campaignId: ${campaignId}`);
    // ここで、サーバーにイベントを送信する処理を実装予定
  };

  const checkPlaybackProgress = (currentTime) => {
    const currentPercentage = currentTime / videoDuration;
    playbackMilestones.forEach(milestone => {
      if (currentPercentage >= milestone && !reachedMilestones.has(milestone)) {
        reachedMilestones.add(milestone);
        sendPlaybackEvent(milestone, publisherId, campaignId);
      }
    });
  };

  const createBigHeader = () => {
    const bigHeader = document.getElementById('BigHeader');
    if (bigHeader) {
      const headerHeight = Math.floor(window.innerHeight * 0.8);
      const videoWidth = Math.floor(headerHeight * 16 / 9);
      bigHeader.innerHTML = `
        <div style="
          background-color: #333;
          color: white;
          padding: 20px;
          text-align: center;
          width: 100%;
          height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        ">
          <video id="headerVideo" width="${videoWidth}" height="${headerHeight}" autoplay controls muted>
            <source src="${videoSrc}" type="video/mp4">
          </video>
        </div>
      `;
    }
  };

  const createSideBanner = () => {
    const banner = document.createElement('div');
    banner.id = 'sideBanner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: -400px;
      width: 400px;
      height: 225px;
      background-color: #f0f0f0;
      transition: right 0.3s ease-in-out;
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    banner.innerHTML = `
      <video id="bannerVideo" width="400" height="225" controls muted>
        <source src="${videoSrc}" type="video/mp4">
      </video>
    `;
    document.body.appendChild(banner);
    return banner;
  };

  createBigHeader();
  const sideBanner = createSideBanner();
  const headerVideo = document.getElementById('headerVideo');
  const bannerVideo = document.getElementById('bannerVideo');

  let bigHeaderVisible = true;
  let lastScrollTop = 0;

  headerVideo.addEventListener('loadedmetadata', () => {
    videoDuration = headerVideo.duration;
  });

  headerVideo.addEventListener('timeupdate', () => {
    videoTime = headerVideo.currentTime;
    checkPlaybackProgress(videoTime);
  });

  bannerVideo.addEventListener('timeupdate', () => {
    videoTime = bannerVideo.currentTime;
    checkPlaybackProgress(videoTime);
  });

  window.addEventListener('scroll', () => {
    const bigHeader = document.getElementById('BigHeader');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const bigHeaderBottom = bigHeader.getBoundingClientRect().bottom;

    if (bigHeaderBottom <= 0 && bigHeaderVisible) {
      sideBanner.style.right = '20px';
      bigHeaderVisible = false;
      headerVideo.pause();
      bannerVideo.currentTime = videoTime;
      bannerVideo.play();
    } else if (bigHeaderBottom > 0 && !bigHeaderVisible) {
      sideBanner.style.right = '-400px';
      bigHeaderVisible = true;
      bannerVideo.pause();
      headerVideo.currentTime = bannerVideo.currentTime;
      headerVideo.play();
    }

    lastScrollTop = scrollTop;
  });
});